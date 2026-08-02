# Space Cat Google Ads API

This tool creates the English Space Cat App campaign without browser
automation. It is intentionally conservative:

- Dry-run is the default and makes no API call.
- `--apply` is required before anything is created.
- The campaign is always created as `PAUSED`.
- The campaign targets English users in the United States, United Kingdom,
  Canada, and Australia.
- Headlines and descriptions come from `store/ads/copy.json`.
- Five local PNG campaign assets are uploaded and attached.

## One-time Google setup

Google Ads API calls require both OAuth 2.0 credentials and a Google Ads
developer token.

1. Obtain a developer token from the API Center of a Google Ads manager
   account.
2. Create OAuth desktop credentials in a Google Cloud project.
3. Generate a refresh token for the Google Ads scope:
   `https://www.googleapis.com/auth/adwords`.
4. Copy `.env.example` to `.env` and fill in the values. `.env` is ignored by
   Git.

The target Google Ads customer is `443-319-9603`. Set
`GOOGLE_ADS_LOGIN_CUSTOMER_ID` only when authentication goes through a manager
account.

Official setup references:

- https://developers.google.com/google-ads/api/docs/oauth/overview
- https://developers.google.com/google-ads/api/docs/get-started/dev-token
- https://developers.google.com/google-ads/api/docs/app-campaigns/create-campaign

## Install

```bash
cd "/Users/vahap/Documents/SPACE CAT"
python3.12 -m venv tools/google_ads/.venv
tools/google_ads/.venv/bin/python -m pip install -r tools/google_ads/requirements.txt
```

The tool reads `tools/google_ads/.env` automatically. Existing shell
environment variables take precedence.

## Review without API access

Amounts are in the Google Ads account currency. Both values are mandatory so
the tool never guesses a spend level.

```bash
tools/google_ads/.venv/bin/python tools/google_ads/create_spacecat_campaign.py \
  --daily-budget 100 \
  --target-cpa 50
```

## Create the paused campaign

Only run this after confirming the account currency, daily budget, and target
CPA:

```bash
tools/google_ads/.venv/bin/python tools/google_ads/create_spacecat_campaign.py \
  --daily-budget 100 \
  --target-cpa 50 \
  --apply
```

The command checks for an existing campaign with the same name before creating
anything. On success, it prints all created Google Ads resource names.

## Videos

Google Ads App campaigns use YouTube video assets. A local MP4 is not accepted
as a YouTube video asset by the Google Ads API. Upload the approved videos to
YouTube first, then repeat `--youtube-video-id`:

```bash
tools/google_ads/.venv/bin/python tools/google_ads/create_spacecat_campaign.py \
  --daily-budget 100 \
  --target-cpa 50 \
  --youtube-video-id VIDEO_ID_VERTICAL \
  --youtube-video-id VIDEO_ID_LANDSCAPE \
  --apply
```

If no YouTube video ID is supplied, Google Ads may generate video automatically
from the Play Store listing and the supplied text and image assets.
