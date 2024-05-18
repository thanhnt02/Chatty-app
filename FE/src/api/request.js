import APIs from './APIs'
import localStore from '../utils/localStorage'
import Util from '../utils'
import axios from "../services/axios"
export default class Request{

    static async send(url, post, method, header='',resend = false){

        let token = await localStore.get('accessToken', 'not-set');
        if (Util.isEmpty(token)) token = 'not-set';

        if (header === '') {
            header = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
            };
        } else {
            header = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                ...header,
            };
        }

        const contentType = header['Content-Type'];
        let data = {
            method: method,
            mode: 'cors',
            headers: header,
        };

        if (method.toUpperCase() !== 'GET') {
            data.data = contentType === 'application/json' ? JSON.stringify(post) : post;
        }

        console.log('Sent data: ' + data.method + ' ' + url, post); // easier check

        try {
            const response = await axios(url, data);
            return response;
        } catch (error) {
            console.error('Sent Request (resend ' + resend + ') got Error: ', error);
            return { result: 'Failed', msg: 'Connection failed. Oops, we caught an error!' };
        }
    }

    static async get(url, header='')
    {
        return this.send(url , {}, 'GET', header)
    }

    static async post(url, post={}, header='')
    {
        return this.send(url, post, 'POST', header)
    } 

    static async put(url, post={}, header='')
    {
        return this.send(url, post, 'PUT', header) 
    }

    static async delete(url, post={}, header='')
    {
        return this.send(url, post, 'DELETE', header)
    }
}
