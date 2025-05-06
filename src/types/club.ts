export interface CreateClubDTO {
    clubName: string
    description: string
    founderUserId: number
    logoUrl: string
}

export interface UpdateClubDTO extends CreateClubDTO {
    clubId: number
}

export interface ClubVO {
    clubId: number
    clubName: string
    description: string
    founderUserName: string
    logoUrl?: string
    enabled?: boolean
}
