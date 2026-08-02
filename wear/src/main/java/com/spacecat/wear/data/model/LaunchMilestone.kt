package com.spacecat.wear.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class LaunchMilestoneCode {
    IGNITION, LIFTOFF, MAX_Q, MECO, STAGE_SEPARATION,
    UPPER_STAGE_START, UPPER_STAGE_CUTOFF, FAIRING_SEPARATION,
    BOOSTBACK_BURN, ENTRY_BURN, LANDING_BURN, LANDING,
    ORBIT_INSERTION, PAYLOAD_DEPLOYMENT,
}

@Serializable
data class LaunchMilestone(
    val secondsFromT0: Int,
    val code: LaunchMilestoneCode,
    val label: String,
) {
    val isBoosterEvent: Boolean get() = code in setOf(
        LaunchMilestoneCode.BOOSTBACK_BURN,
        LaunchMilestoneCode.ENTRY_BURN,
        LaunchMilestoneCode.LANDING_BURN,
        LaunchMilestoneCode.LANDING,
    )
}
