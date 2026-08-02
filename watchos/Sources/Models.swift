import Foundation

enum LaunchMilestoneCode: String, Codable {
    case ignition, liftoff, maxQ, meco, stageSeparation
    case upperStageStart, upperStageCutoff, fairingSeparation
    case boostbackBurn, entryBurn, landingBurn, landing
    case orbitInsertion, payloadDeployment
}

struct LaunchMilestone: Codable, Hashable {
    let secondsFromT0: Int
    let code: LaunchMilestoneCode
    let label: String

    var isBoosterEvent: Bool {
        [.boostbackBurn, .entryBurn, .landingBurn, .landing].contains(code)
    }
}

struct Launch: Identifiable, Codable {
    let id: String
    let name: String
    let net: Date
    let statusAbbrev: String
    let statusName: String
    let agency: String
    let agencyAbbrev: String?
    let pad: String
    let location: String
    let missionDescription: String
    let orbit: String
    let rocketFullName: String
    // Canlı yayın (Dalga 1) — eski önbellek kayıtları için varsayılanlı.
    var webcastLive: Bool = false
    var webcastUrl: String = ""
    var webcastTitle: String = ""
    // Hava & GO ihtimali (Dalga 3).
    var probability: Int = -1
    var weatherConcerns: String = ""
    var padLat: Double = 0
    var padLng: Double = 0
    // Fırlatma istatistiği (Dalga 4).
    var agencyLaunchCount: Int = 0
    var padLaunchCount: Int = 0
    var providerSuccess: Int = 0
    var providerTotal: Int = 0
    // Görev/roket görseli (Dalga 5) — thumbnail öncelikli.
    var imageUrl: String = ""
    // Ajans markası (Dalga 8).
    var agencyLogoUrl: String = ""
    var agencyType: String = ""
    // Source-planned schedule contract; never represented as live telemetry.
    var milestones: [LaunchMilestone] = []
    var failureReason: String = ""

    // LL2 isim formatı: "Falcon 9 Block 5 | Starlink Group 12-34"
    var vehicle: String { name.components(separatedBy: " | ").first ?? name }
    var mission: String {
        let parts = name.components(separatedBy: " | ")
        return parts.count > 1 ? parts[1] : name
    }

    var hasWebcast: Bool { !webcastUrl.isEmpty }
    var hasProbability: Bool { (0...100).contains(probability) }
    var hasPadCoords: Bool { padLat != 0 || padLng != 0 }
    var hasStats: Bool { agencyLaunchCount > 0 || providerTotal > 0 }
}

// MARK: - LL2 DTO'ları

struct LaunchListResponse: Decodable {
    let results: [LaunchDTO]
}

struct LaunchDTO: Decodable {
    let id: String
    let name: String
    let net: String?
    let status: StatusDTO?
    let launch_service_provider: AgencyDTO?
    let rocket: RocketDTO?
    let mission: MissionDTO?
    let pad: PadDTO?
    let webcast_live: Bool?
    let vidURLs: [VidUrlDTO]?
    let probability: Int?
    let weather_concerns: String?
    let agency_launch_attempt_count: Int?
    let pad_launch_attempt_count: Int?
    let image: ImageDTO?
    let timeline: [TimelineEventDTO]?
    let failreason: String?
}

struct TimelineEventDTO: Decodable {
    let type: TimelineTypeDTO?
    let relative_time: String?
    let description: String?
}

struct TimelineTypeDTO: Decodable {
    let name: String?
    let abbrev: String?
}

struct ImageDTO: Decodable {
    let image_url: String?
    let thumbnail_url: String?
}

struct VidUrlDTO: Decodable {
    let priority: Int?
    let title: String?
    let url: String?
    let live: Bool?
}

struct StatusDTO: Decodable {
    let name: String?
    let abbrev: String?
}

struct AgencyDTO: Decodable {
    let name: String?
    let abbrev: String?
    let successful_launches: Int?
    let total_launch_count: Int?
    let logo: ImageDTO?
    let type: AgencyTypeDTO?
}

struct AgencyTypeDTO: Decodable {
    let name: String?
}

struct RocketDTO: Decodable {
    let configuration: RocketConfigDTO?
}

struct RocketConfigDTO: Decodable {
    let full_name: String?
}

struct MissionDTO: Decodable {
    let description: String?
    let orbit: OrbitDTO?
}

struct OrbitDTO: Decodable {
    let name: String?
    let abbrev: String?
}

struct PadDTO: Decodable {
    let name: String?
    let latitude: Double?
    let longitude: Double?
    let location: LocationDTO?
}

struct LocationDTO: Decodable {
    let name: String?
}
