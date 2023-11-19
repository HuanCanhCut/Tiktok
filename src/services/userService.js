import * as request from '~/utils/httpRequest'

export const getSuggested = async (page, perPage) => {
    try {
        const result = await request.get(`users/suggested?`, {
            params: {
                page,
                per_page: perPage,
            },
        })
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getFollowingAccounts = async (page, accessToken) => {
    try {
        const result = await request.get(`me/followings?`, {
            params: {
                page,
            },
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        return result
    } catch (error) {
        console.log(error)
    }
}

export const getAnUser = async ({ nickname }) => {
    try {
        const response = await request.get(`users/@${nickname}`)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const followAnUser = async ({ userId, accessToken }) => {
    try {
        const response = await request.post(`users/${userId}/follow`, [], {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

export const unFollowUser = async ({ userId, accessToken }) => {
    try {
        const response = await request.post(`users/${userId}/unfollow`, [], {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
        return response
    } catch (error) {
        console.log(error)
    }
}
