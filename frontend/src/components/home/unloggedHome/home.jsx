import light from '../../../assets/lightmode-car.png';
import dark from '../../../assets/darkmode-car.png';
import './home.css';
import { useEffect, useRef, useState } from 'react';
import { useSiteDefinitions } from '../../../context/siteDefinitions';
import { useNavigate } from 'react-router-dom';

export function Home(){

    const car = useRef();
    const interval = useRef();
    const {theme} = useSiteDefinitions()
    const imageList = [0, 50, 100]
    const [currentImage, setCurrentImage] = useState(0);
    const navigator = useNavigate();

    useEffect(() => {
        car.current.style.backgroundPosition = `${imageList[currentImage]}%`;
        if (interval.current) clearInterval(interval.current);

        interval.current = setInterval(() => {
            let current = currentImage + 1;
            if (current >= imageList.length) current = 0;
            setCurrentImage(current);
        }, 4500);

        return () => clearInterval(interval.current);
    }, [currentImage])

    return(
        <section className='home-main-container'>

            <div className='hero-section-outer-container'>
                <div className='hero-section'>
                    <span className='title'>
                        Taskify
                    </span>
                    <span className='subtitle'>
                        Organize, Collaborate, and Stay Productive.
                    </span>
                    <span className='description'>
                        A full-stack task manager app with real-time updates, team collaboration, and a drag-and-drop Kanban board.
                    </span>
                    <span className='description'>
                        Stay organized with role-based access and a dynamic calendar—built with React, Node.js, and MongoDB.
                    </span>
                    <div className='buttons-hero-section'>
                        <button onClick={() => navigator('/signIn')}>
                            Get Started
                        </button>
                        <a href='https://github.com/GrongoTheGrog/task-manager' target='#'>
                            <i class="fa-brands fa-github"></i>
                        </a>
                    </div>
                </div>
                <div
                    className='char-container'
                    style={{backgroundImage: `url(${!theme.data ? dark : light})`}}
                    ref={car}
                >
                    <div className='dots-car'>
                        {[0, 1, 2].map(n => (
                            <div
                                style={{
                                    backgroundColor: (currentImage === n ? 'var(--neutral2)' : '')}}
                                onClick={() => setCurrentImage(n)}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            <span className='extra-items-title'>
                Core Features
            </span>

            <div className='extra-items-container'>
                <div className='extra-item-home'>
                    <span className='title'>
                        <i className='material-icons'>
                            update
                        </i>
                        Real-Time Updates 
                    </span>

                    <span className='description'>
                        Updates are made with a complete WebSocket integration, using the Socket.IO package.
                    </span>
                </div>

                <div className='extra-item-home'>
                    <span className='title'>
                        <i className='material-icons'>
                            pending_actions
                        </i>
                        Task Scheduling
                    </span>

                    <span className='description'>
                        Tasks are scheduled based on it’s deadline, set by it’s author, and can be displayed either in the team or in the personal calendar.
                    </span>
                </div>

                <div className='extra-item-home'>
                    <span className='title'>
                        <i className='material-icons'>
                            groups
                        </i>
                        Role-Based Teams
                    </span>

                    <span className='description'>
                        Taskify allows teams to collaborate efficiently with role-based access control. Each member is assigned a specific role, ensuring the right people have the right permissions.
                    </span>
                </div>
            </div>


            <span className='extra-items-title'>
                Technologies
            </span>


            <div className='extra-items-container' style={{width: '50vw'}}>
                <div className='extra-item-home'>
                    <i class="fa-solid fa-desktop"></i>

                    <span className='title'>
                        Front End
                    </span>

                    <span className='description'>
                        Taskify’s frontend is built with React, but also with several other libraries, such as Axios, Socket.IO and Dnd-kit.  
                    </span>
                </div>

                <div className='extra-item-home'>
                    <i class="fa-solid fa-server"></i>

                    <span className='title'>
                        Backend
                    </span>

                    <span className='description'>
                        Built with Node.js, Express, and MongoDB for a scalable and efficient backend.                    
                    </span>
                </div>
            </div>

            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>

            <div className='footer'>
                <a href='https://github.com/GrongoTheGrog' target='#'>
                    My github
                    <i className='material-icons'>
                        open_in_new
                    </i>
                </a>
            </div>
        </section>
    )
}


export function Loading(){


    return(
        <div className='loading-container-home-card'>
            <i className={'material-icons loading'}>
                refresh
            </i>
        </div>

    )
}



export function remainingTime(time){

    let realTime = time;
    if (time < 0){
        realTime = -1 * time;
    }
    let days = Math.floor(realTime / (1000 * 60 * 60 * 24));
    let hours = Math.floor(realTime / (1000 * 60 * 60) % 24);
    let minutes = Math.floor(realTime / (1000 * 60) % 60);
    let seconds = Math.floor(realTime / 1000 % 60);


    return `${days ? days + 'd' : ''} ${hours ? hours + 'h' : ''} ${minutes ? minutes + 'm' : ''} ${time < 0 ? 'ago' : ''}`
}