import { useContext, createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const DefinitionsProvider = createContext();


export function useSiteDefinitions(){
    return useContext(DefinitionsProvider);
}

export function SiteDefinitions({children}){

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

    const [socket, setSocket] = useState(null);

    const [api, setApi] = useState(null);

    const [error, setError] = useState(null);

    const [blanket, setBlanket] = useState(false);

    const errorTimeout = useRef();

    const changeError = (err) => {
        setError(err);
        if (errorTimeout.current) clearInterval(errorTimeout.current);
        const errorDOM = document.querySelector('.error-container');
        errorDOM.classList.add('active');

        errorTimeout.current = setTimeout(() => {
            errorDOM.classList.remove('active');
        }, 3000)
    }

    function changeUser(user){
        localStorage.setItem('user', JSON.stringify(user));
        setUser(() => user);
    }


    useEffect(() => {
        const newSocket = io('http://localhost:9000', {
            transports: ['websocket'],
            headers: {
                type: 'websocket'
            },
            withCredentials: true
        });
        setSocket(newSocket);


        newSocket.on('connect', () => {
            console.log('connected')
        });

        newSocket.on('connect_error', (error) => {
            console.log(error)
        });



        const fetch = axios.create({
            baseURL: 'http://localhost:9000',
            withCredentials: true
        });

        
        const accessToken = localStorage.getItem('jwtAccess') || 0;

        fetch.interceptors.request.use(
            function (config) {
                if (accessToken) {
                    const accessToken = localStorage.getItem('jwtAccess') || 0;
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            }, 
            function (error) {
                return Promise.reject(error);
            }
        );

        fetch.interceptors.response.use(
            (response) => response, 
            async (error) => {
                if (error.response?.status === 401) {
                    try {
                        const { data } = await fetch.get('/refresh');


                        localStorage.setItem('jwtAccess', data.token);
                        changeUser(data.user)
                        error.config.headers.Authorization = `Bearer ${data}`;
                        return fetch(error.config);
                    }catch(err) {
                        console.log('log in again');
                        changeUser(null);
                        return Promise.reject(err)
                    }
                }
                return Promise.reject(error);
            } 
        )

        setApi(() => fetch)
        return () => newSocket.disconnect();
    }, []);



    const [theme, setTheme] = useState(true);

    const toggleTheme = () => {
        const body = document.querySelector('body');
        setTheme(prev => {
            prev ?
            body.classList.remove('theme') :
            body.classList.add('theme');

            return !prev;
        })

    }

    const definitions = {
        theme: { data: theme, change: toggleTheme },
        socket: { data: socket, change: setSocket },
        user: { data: user, change: changeUser},
        error: { data: error, change: changeError },
        api: { data: api, change: changeError},
        blanket: { data: blanket, change: setBlanket}
    }

    return (
        <DefinitionsProvider.Provider value={definitions}>
            {children}
        </DefinitionsProvider.Provider>
    )
}