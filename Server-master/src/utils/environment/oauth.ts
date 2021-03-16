/* eslint-disable camelcase */
import Axios from 'axios';
import { stringify } from 'querystring';

export async function getUser(code: string): Promise<any> {
    const token = await Axios.post('https://discord.com/api/v7/oauth2/token', stringify({
        client_id: '746146208757579858',
        client_secret: 'BoOLyh5n1kkpAodHyyOSmQAlUMtiy1Qr - this was reset too hahahah ajjajajaj\',
        redirect_uri: 'http://localhost:3000/auth/discord/callback',
        grant_type: 'authorization_code',
        code,
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).catch(() => { return; });

    if (token) {
        const user = await Axios.get('https://discordapp.com/api/v7/users/@me', {
            headers: {
                'Authorization': `Bearer ${token.data.access_token}`,
            },
        }).catch(() => { return; });
    
        if (user) {
            return { user: user.data, token: token.data };
        }
    } else return 'Invalid code';
}

export async function addGuildMember(data: any): Promise<any> {
    if (!data.token) return 'Invalid code.';

    const info = JSON.stringify({
        'access_token': data.token.access_token,
        'roles': ['755165764364927096'],
    });
    const res = await Axios.put(`https://discord.com/api/v7/guilds/754728681318121582/members/${data.user.id}`, info, {
        headers: {
            'Authorization': 'Bot NzQ2MTQ2MjA4NzU3NTc5ODU4.Xz8Ezg.ltjcUoDlWO01h14OHe_QimYlPYI',
            'Content-Type': 'application/json',
            'Content-Length': info.length,
        },
    }).catch(err => console.log(err));

    await Axios.put(`https://discord.com/api/v7/guilds/754728681318121582/members/${data.user.id}/roles/755165764364927096`, JSON.stringify({ 'access_token': data.token.access_token }), {
        headers: {
            'Authorization': 'Bot NzQ2MTQ2MjA4NzU3NTc5ODU4.Xz8Ezg.ltjcUoDlWO01h14OHe_QimYlPYI - also reset jajajajajajajajaj',
            'Content-Type': 'application/json',
            'Content-Length': info.length,
        },
    }).catch(err => console.log(err));

    return res ? res : 'Invalid code.';
}
