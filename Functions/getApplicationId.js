const axios = require('axios');

async function getApplicationId({ token }) {
    try {
        const userData = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bot ${token}`
            }
        });
        return userData.data.id;
    } catch (err) {
        throw new Error("Invalid Token");
    }
}

module.exports = { getApplicationId };
