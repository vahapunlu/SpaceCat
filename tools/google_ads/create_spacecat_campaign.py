#!/usr/bin/env python3
"""Create Space Cat's English Google Ads App campaign in PAUSED state.

The command is safe by default: without --apply it only prints the plan and
does not load credentials or call Google Ads.
"""

from __future__ import annotations

import argparse
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
import json
import os
from pathlib import Path
import struct
import sys
from typing import Any, Iterable


API_VERSION = "v24"
APP_ID = "com.spacecat.terminal"
DEFAULT_CUSTOMER_ID = "443-319-9603"
DEFAULT_CAMPAIGN_NAME = "Space Cat | EN | Installs | 2026-07"
DEFAULT_AD_GROUP_NAME = "Space Enthusiasts | EN"
LANGUAGE_ID_ENGLISH = "1000"
GEO_TARGETS = {
    "United States": "2840",
    "United Kingdom": "2826",
    "Canada": "2124",
    "Australia": "2036",
}

REPO_ROOT = Path(__file__).resolve().parents[2]
COPY_PATH = REPO_ROOT / "store" / "ads" / "copy.json"
IMAGE_PATHS = [
    REPO_ROOT
    / "store"
    / "ads"
    / "images"
    / "spacecat-integrated-watch-1200x1200-v5-approved.png",
    REPO_ROOT
    / "store"
    / "ads"
    / "images"
    / "spacecat-integrated-watch-1200x1500-v5-approved.png",
    REPO_ROOT
    / "store"
    / "ads"
    / "images"
    / "spacecat-integrated-watch-1200x628-v3.png",
    REPO_ROOT / "store" / "ads" / "images" / "spacecat-logo-1200x1200.png",
    REPO_ROOT / "store" / "ads" / "images" / "spacecat-logo-1200x628.png",
]


def load_local_env() -> None:
    """Load tools/google_ads/.env without overriding exported variables."""
    env_path = Path(__file__).with_name(".env")
    if not env_path.is_file():
        return
    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")
        if key and key not in os.environ:
            os.environ[key] = value


def clean_customer_id(value: str) -> str:
    customer_id = value.replace("-", "").strip()
    if not customer_id.isdigit():
        raise argparse.ArgumentTypeError("customer ID must contain only digits or hyphens")
    return customer_id


def positive_decimal(value: str) -> Decimal:
    try:
        parsed = Decimal(value)
    except InvalidOperation as exc:
        raise argparse.ArgumentTypeError(f"invalid monetary amount: {value}") from exc
    if parsed <= 0:
        raise argparse.ArgumentTypeError("amount must be greater than zero")
    return parsed


def to_micros(value: Decimal) -> int:
    return int((value * Decimal("1000000")).quantize(Decimal("1"), ROUND_HALF_UP))


def load_copy() -> dict[str, list[str]]:
    payload = json.loads(COPY_PATH.read_text(encoding="utf-8"))
    copy = payload["en"]
    headlines = copy["headlines"]
    descriptions = copy["descriptions"]
    if not 1 <= len(headlines) <= 5:
        raise ValueError("English copy must contain 1-5 headlines")
    if not 1 <= len(descriptions) <= 5:
        raise ValueError("English copy must contain 1-5 descriptions")
    if any(len(text) > 30 for text in headlines):
        raise ValueError("an English headline exceeds Google Ads' 30-character limit")
    if any(len(text) > 90 for text in descriptions):
        raise ValueError("an English description exceeds Google Ads' 90-character limit")
    return {"headlines": headlines, "descriptions": descriptions}


def validate_local_assets() -> None:
    missing = [str(path) for path in [COPY_PATH, *IMAGE_PATHS] if not path.is_file()]
    if missing:
        raise FileNotFoundError("missing campaign assets:\n" + "\n".join(missing))


def png_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 24 or data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("only PNG campaign images are currently supported")
    return struct.unpack(">II", data[16:24])


def build_plan(args: argparse.Namespace, copy: dict[str, list[str]]) -> dict[str, Any]:
    return {
        "mode": "APPLY (creates resources)" if args.apply else "DRY RUN (no API calls)",
        "customer_id": args.customer_id,
        "campaign_name": args.campaign_name,
        "campaign_status": "PAUSED",
        "app_id": APP_ID,
        "goal": "App installs / target CPA",
        "daily_budget_account_currency": str(args.daily_budget),
        "target_cpa_account_currency": str(args.target_cpa),
        "language": "English",
        "locations": list(GEO_TARGETS),
        "headlines": copy["headlines"],
        "descriptions": copy["descriptions"],
        "images": [str(path.relative_to(REPO_ROOT)) for path in IMAGE_PATHS],
        "youtube_video_ids": args.youtube_video_id,
    }


def load_google_ads_client() -> Any:
    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError as exc:
        raise RuntimeError(
            "google-ads is not installed; run: "
            "python -m pip install -r tools/google_ads/requirements.txt"
        ) from exc

    required = {
        "developer_token": "GOOGLE_ADS_DEVELOPER_TOKEN",
        "client_id": "GOOGLE_ADS_CLIENT_ID",
        "client_secret": "GOOGLE_ADS_CLIENT_SECRET",
        "refresh_token": "GOOGLE_ADS_REFRESH_TOKEN",
    }
    missing = [env_name for env_name in required.values() if not os.getenv(env_name)]
    if missing:
        raise RuntimeError("missing Google Ads credentials: " + ", ".join(missing))

    config: dict[str, Any] = {
        key: os.environ[env_name] for key, env_name in required.items()
    }
    config["use_proto_plus"] = True
    login_customer_id = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "").replace("-", "")
    if login_customer_id:
        config["login_customer_id"] = login_customer_id
    return GoogleAdsClient.load_from_dict(config, version=API_VERSION)


def get_customer_currency(client: Any, customer_id: str) -> str:
    service = client.get_service("GoogleAdsService")
    query = "SELECT customer.currency_code FROM customer LIMIT 1"
    response = service.search(customer_id=customer_id, query=query)
    row = next(iter(response))
    return row.customer.currency_code


def ensure_campaign_name_available(
    client: Any, customer_id: str, campaign_name: str
) -> None:
    service = client.get_service("GoogleAdsService")
    escaped = campaign_name.replace("\\", "\\\\").replace("'", "\\'")
    query = (
        "SELECT campaign.id, campaign.status "
        "FROM campaign "
        f"WHERE campaign.name = '{escaped}' "
        "AND campaign.status != 'REMOVED' "
        "LIMIT 1"
    )
    existing = list(service.search(customer_id=customer_id, query=query))
    if existing:
        row = existing[0]
        raise RuntimeError(
            f"campaign already exists: {campaign_name} "
            f"(id={row.campaign.id}, status={row.campaign.status})"
        )


def upload_image_assets(client: Any, customer_id: str) -> list[str]:
    service = client.get_service("AssetService")
    operations = []
    for path in IMAGE_PATHS:
        data = path.read_bytes()
        width, height = png_dimensions(data)
        operation = client.get_type("AssetOperation")
        asset = operation.create
        asset.name = f"Space Cat | {path.stem}"
        asset.type_ = client.enums.AssetTypeEnum.IMAGE
        asset.image_asset.data = data
        asset.image_asset.file_size = len(data)
        asset.image_asset.mime_type = client.enums.MimeTypeEnum.IMAGE_PNG
        asset.image_asset.full_size.width_pixels = width
        asset.image_asset.full_size.height_pixels = height
        operations.append(operation)
    response = service.mutate_assets(customer_id=customer_id, operations=operations)
    return [result.resource_name for result in response.results]


def create_youtube_assets(
    client: Any, customer_id: str, video_ids: Iterable[str]
) -> list[str]:
    video_ids = list(video_ids)
    if not video_ids:
        return []
    service = client.get_service("AssetService")
    operations = []
    for video_id in video_ids:
        operation = client.get_type("AssetOperation")
        asset = operation.create
        asset.name = f"Space Cat | YouTube | {video_id}"
        asset.type_ = client.enums.AssetTypeEnum.YOUTUBE_VIDEO
        asset.youtube_video_asset.youtube_video_id = video_id
        operations.append(operation)
    response = service.mutate_assets(customer_id=customer_id, operations=operations)
    return [result.resource_name for result in response.results]


def create_budget(
    client: Any, customer_id: str, campaign_name: str, daily_budget: Decimal
) -> str:
    service = client.get_service("CampaignBudgetService")
    operation = client.get_type("CampaignBudgetOperation")
    budget = operation.create
    budget.name = f"{campaign_name} | Budget"
    budget.amount_micros = to_micros(daily_budget)
    budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD
    budget.explicitly_shared = False
    response = service.mutate_campaign_budgets(
        customer_id=customer_id, operations=[operation]
    )
    return response.results[0].resource_name


def create_campaign(
    client: Any,
    customer_id: str,
    campaign_name: str,
    budget_resource_name: str,
    target_cpa: Decimal,
) -> str:
    service = client.get_service("CampaignService")
    operation = client.get_type("CampaignOperation")
    campaign = operation.create
    campaign.name = campaign_name
    campaign.campaign_budget = budget_resource_name
    campaign.status = client.enums.CampaignStatusEnum.PAUSED
    campaign.advertising_channel_type = (
        client.enums.AdvertisingChannelTypeEnum.MULTI_CHANNEL
    )
    campaign.advertising_channel_sub_type = (
        client.enums.AdvertisingChannelSubTypeEnum.APP_CAMPAIGN
    )
    campaign.target_cpa.target_cpa_micros = to_micros(target_cpa)
    campaign.app_campaign_setting.app_id = APP_ID
    campaign.app_campaign_setting.app_store = (
        client.enums.AppCampaignAppStoreEnum.GOOGLE_APP_STORE
    )
    campaign.app_campaign_setting.bidding_strategy_goal_type = (
        client.enums.AppCampaignBiddingStrategyGoalTypeEnum.OPTIMIZE_INSTALLS_TARGET_INSTALL_COST
    )
    campaign.contains_eu_political_advertising = (
        client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
    )
    campaign.start_date_time = (date.today() + timedelta(days=1)).strftime(
        "%Y%m%d 00:00:00"
    )
    response = service.mutate_campaigns(
        customer_id=customer_id, operations=[operation]
    )
    return response.results[0].resource_name


def add_targeting(client: Any, customer_id: str, campaign_resource_name: str) -> None:
    criterion_service = client.get_service("CampaignCriterionService")
    geo_service = client.get_service("GeoTargetConstantService")
    google_ads_service = client.get_service("GoogleAdsService")
    operations = []

    for location_id in GEO_TARGETS.values():
        operation = client.get_type("CampaignCriterionOperation")
        criterion = operation.create
        criterion.campaign = campaign_resource_name
        criterion.location.geo_target_constant = (
            geo_service.geo_target_constant_path(location_id)
        )
        operations.append(operation)

    language_operation = client.get_type("CampaignCriterionOperation")
    language_criterion = language_operation.create
    language_criterion.campaign = campaign_resource_name
    language_criterion.language.language_constant = (
        google_ads_service.language_constant_path(LANGUAGE_ID_ENGLISH)
    )
    operations.append(language_operation)

    criterion_service.mutate_campaign_criteria(
        customer_id=customer_id, operations=operations
    )


def create_ad_group(
    client: Any, customer_id: str, campaign_resource_name: str, name: str
) -> str:
    service = client.get_service("AdGroupService")
    operation = client.get_type("AdGroupOperation")
    ad_group = operation.create
    ad_group.name = name
    ad_group.status = client.enums.AdGroupStatusEnum.ENABLED
    ad_group.campaign = campaign_resource_name
    response = service.mutate_ad_groups(
        customer_id=customer_id, operations=[operation]
    )
    return response.results[0].resource_name


def ad_text_asset(client: Any, text: str) -> Any:
    asset = client.get_type("AdTextAsset")
    asset.text = text
    return asset


def ad_image_asset(client: Any, resource_name: str) -> Any:
    asset = client.get_type("AdImageAsset")
    asset.asset = resource_name
    return asset


def ad_video_asset(client: Any, resource_name: str) -> Any:
    asset = client.get_type("AdVideoAsset")
    asset.asset = resource_name
    return asset


def create_app_ad(
    client: Any,
    customer_id: str,
    ad_group_resource_name: str,
    copy: dict[str, list[str]],
    image_resource_names: list[str],
    video_resource_names: list[str],
) -> str:
    service = client.get_service("AdGroupAdService")
    operation = client.get_type("AdGroupAdOperation")
    ad_group_ad = operation.create
    ad_group_ad.status = client.enums.AdGroupAdStatusEnum.ENABLED
    ad_group_ad.ad_group = ad_group_resource_name
    app_ad = ad_group_ad.ad.app_ad
    app_ad.headlines.extend(
        [ad_text_asset(client, text) for text in copy["headlines"]]
    )
    app_ad.descriptions.extend(
        [ad_text_asset(client, text) for text in copy["descriptions"]]
    )
    app_ad.images.extend(
        [ad_image_asset(client, name) for name in image_resource_names]
    )
    app_ad.youtube_videos.extend(
        [ad_video_asset(client, name) for name in video_resource_names]
    )
    response = service.mutate_ad_group_ads(
        customer_id=customer_id, operations=[operation]
    )
    return response.results[0].resource_name


def apply_campaign(args: argparse.Namespace, copy: dict[str, list[str]]) -> None:
    client = load_google_ads_client()
    currency = get_customer_currency(client, args.customer_id)
    print(f"Google Ads account currency: {currency}")
    print(
        f"Daily budget: {args.daily_budget} {currency}; "
        f"target CPA: {args.target_cpa} {currency}"
    )
    ensure_campaign_name_available(client, args.customer_id, args.campaign_name)

    print("Uploading image assets...")
    image_resources = upload_image_assets(client, args.customer_id)
    video_resources = create_youtube_assets(
        client, args.customer_id, args.youtube_video_id
    )
    print("Creating non-shared budget...")
    budget_resource = create_budget(
        client, args.customer_id, args.campaign_name, args.daily_budget
    )
    print("Creating PAUSED App campaign...")
    campaign_resource = create_campaign(
        client,
        args.customer_id,
        args.campaign_name,
        budget_resource,
        args.target_cpa,
    )
    print("Adding English and country targeting...")
    add_targeting(client, args.customer_id, campaign_resource)
    print("Creating ad group and App ad...")
    ad_group_resource = create_ad_group(
        client, args.customer_id, campaign_resource, args.ad_group_name
    )
    ad_resource = create_app_ad(
        client,
        args.customer_id,
        ad_group_resource,
        copy,
        image_resources,
        video_resources,
    )
    print(
        json.dumps(
            {
                "status": "created_paused",
                "campaign": campaign_resource,
                "budget": budget_resource,
                "ad_group": ad_group_resource,
                "ad": ad_resource,
                "images": image_resources,
                "videos": video_resources,
            },
            indent=2,
        )
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create Space Cat's English App campaign in PAUSED state."
    )
    parser.add_argument(
        "--customer-id",
        type=clean_customer_id,
        default=clean_customer_id(
            os.getenv("GOOGLE_ADS_CUSTOMER_ID", DEFAULT_CUSTOMER_ID)
        ),
    )
    parser.add_argument("--campaign-name", default=DEFAULT_CAMPAIGN_NAME)
    parser.add_argument("--ad-group-name", default=DEFAULT_AD_GROUP_NAME)
    parser.add_argument(
        "--daily-budget",
        type=positive_decimal,
        required=True,
        help="Daily amount in the Google Ads account currency.",
    )
    parser.add_argument(
        "--target-cpa",
        type=positive_decimal,
        required=True,
        help="Target install cost in the Google Ads account currency.",
    )
    parser.add_argument(
        "--youtube-video-id",
        action="append",
        default=[],
        help="Optional YouTube video ID. Repeat to add multiple videos.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Create resources. Without this flag, no API call is made.",
    )
    return parser.parse_args()


def main() -> int:
    load_local_env()
    args = parse_args()
    try:
        validate_local_assets()
        copy = load_copy()
        print(json.dumps(build_plan(args, copy), indent=2, ensure_ascii=False))
        if not args.apply:
            print("\nDry run only. Add --apply after reviewing the plan.")
            return 0
        apply_campaign(args, copy)
        return 0
    except Exception as exc:
        try:
            from google.ads.googleads.errors import GoogleAdsException
        except ImportError:
            GoogleAdsException = ()  # type: ignore[assignment,misc]

        if GoogleAdsException and isinstance(exc, GoogleAdsException):
            print(
                f'Google Ads request "{exc.request_id}" failed: '
                f"{exc.error.code().name}",
                file=sys.stderr,
            )
            for error in exc.failure.errors:
                print(f"- {error.message}", file=sys.stderr)
        else:
            print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
