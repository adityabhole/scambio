import 'whatwg-fetch';

class HttpService {
    getJunks = () => {
        var promise = new Promise((resolve, reject) => {
            fetch('http://localhost:3001/getjunks')
            .then(response => {
                resolve(response.json());
            })
        });
        return promise;
    }

    getMyJunks = (data) => {
        console.log(data);
        var promise = new Promise((resolve, reject) => {
            fetch('http://localhost:3001/usersItems', data)
            .then(response => {
                resolve(response.json());
            })
        });
        return promise;
    }

    getMatches = () => {
        var promise = new Promise((resolve, reject) => {
            fetch('http://localhost:3001/getmatches')
            .then(response => {
                resolve(response.json());
            })
        });
        return promise;
    }
}
export default HttpService;
