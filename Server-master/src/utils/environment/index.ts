/* eslint-disable no-irregular-whitespace */
import { randomBytes } from 'crypto';
import { promises } from 'fs';
import { resolve } from 'path';

export function generateInvite () {
    const key = randomBytes(80)
        .toString('hex');
    return [key.slice(0, 8), key.slice(1, 10), key.slice(3, 7)].join('-');
}

export function generateKey () {
    return randomBytes(20)
        .toString('hex')
        .slice(0, 20);
}

export function generateFileName() {
    return randomBytes(11)
        .toString('hex')
        .slice(0, 11);
}

export function getUploadData (user: any, file: any) {
    let url = `https://${user.settings.domain.subdomain !== null && user.settings.domain.subdomain !== ''
        ? user.settings.domain.subdomain + '.'
        : ''}${user.settings.domain.name}/${file.filename}`;
    if (user.settings.showLink) {
        url = `‎${url}`;
    } else if (user.settings.fakeLink.enabled) {
        url = `<${user.settings.fakeLink.link}>||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${url}`;
    } else if (user.settings.showLink && user.settings.fakeLink.enabled) {
        url = `<${user.settings.fakeLink.link}>||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||${url}`;
    }
    return {
        url,
        type: user.settings.embed.enabled ? 'embed' : 'raw',
    };
}

export async function getUploads (dir: string, search: string) {
    let results: Array<string> = [];

    for (let subDir of await promises.readdir(dir)) {
        subDir = resolve(dir, subDir);
        const stat = await promises.stat(subDir);

        if (stat.isDirectory()) {
            results = results.concat(await getUploads(subDir, search));
        }

        if (stat.isFile() && subDir.endsWith(search)) {
            results.push(subDir);
        }
    }

    return results;
};
