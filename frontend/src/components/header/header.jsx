import { useEffect, useRef, useState } from 'react';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import './header.css';
import { ca } from 'date-fns/locale';

export function Header(){

    const definitions = useSiteDefinitions();
    const user = definitions.user;
    const [navActive, setNavActive] = useState(true);


    useEffect(() => {
        const navBar = document.querySelector('.left-sidebar-container-main');
        if (navBar){
            if (navActive){
                navBar.classList.remove('active');
            }else{
                navBar.classList.add('active');
            }
        }
    }, [navActive])

    return (
        <header>
            <div className='left-header'>
                {user.data ? <div className='menu' onClick={() => setNavActive(prev => !prev)}>
                    <i className='material-icons'>
                        menu
                    </i>
                </div> : null}
                <span className='header-title'>
                    Taskify
                </span>
            </div>
            

            <RightHeaderUser />
        </header>
    )
}

function RightHeaderUser(){

    const {api, error, socket, user} = useSiteDefinitions();
    const [notifications, setNotifications] = useState([]);
    const [deletedReq, setDeletedReq] = useState();
    const [display, setDisplay] = useState(false);
    const container = useRef();
    const notificationsIcon = useRef();
    

    //get the requests notifications and add to the notification state
    useEffect(() => {

        //only if socket and api are truthy, since header isnt part of apps conditional rendering
        if (api.data && socket && user.data){
            async function getRequests() {
                try{
                    const requests = await api.data.get('/getreq');
                    
                    setNotifications(() => requests.data);
                }catch(err){
                    error.change(err?.response?.data?.error || err.message);
                }
            }

            getRequests();
        }
    }, [api, socket, deletedReq, user.data])

    useEffect(() => {
        if (socket.data){
            function handleNewRequest(req){
                setNotifications(prev => [...prev, req]);
            }

            socket.data.on('create-req', handleNewRequest)

            return () => socket.data.off('create-req', handleNewRequest)
        }
    }, [socket])

    //define listeners for toggling the display of notifications 
    useEffect(() => {
        const handleClick = (event) => {
            
            if (container.current){

                //only sets to false if mouse is not above notifications icon
                if (!container.current?.contains(event.target) && !notificationsIcon.current.contains(event.target)){
                    setDisplay(() => false)
                }

            }
        }

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, [display])



    return (
        <div className='right-header'>
            {user ?
            <div className='notifications-container' onClick={() => setDisplay(prev => !prev)} ref={notificationsIcon}>
                <i className='material-icons'>
                    notifications
                </i>

                {notifications.length ? 
                    <span className='notifications-number-displayer'>
                        {notifications.length <= 9 ? notifications.length : '9+'}
                    </span> :
                    null
                }

            </div>: 
            null
            }

            {display ? 
                <div className={'notifications-displayer-container scrollbar'} ref={container}>
                    <span>
                        Notifications
                    </span>
                    {notifications.length ?
                        notifications.map((notification, index) => {
                        return (
                            <RequestCard req={notification} setDeletedReq={setDeletedReq} key={index}/>
                        )
                    }) : 
                    <div className='caught-up'>
                        You are all caught up

                        <i className='material-icons'>
                            done_all
                        </i>
                    </div>
                    }
                </div> :
            null}

            <img src='https://res.cloudinary.com/dbrqsdkjz/image/upload/v1739389623/c3no819rkos5hm2ghv41.jpg' className='profile-pic-header'/>
        </div>
    )
}

function RequestCard({req, setDeletedReq}){
    
    const {api, error, socket, enteringTeam} = useSiteDefinitions();
    console.log(req);

    function solveReq(accept) {

        return async function(){
            console.log('send')
            try{
                const solveReq = await api.data.post('/solvereq', {
                    reqId: req._id,
                    accept
                });

                if(accept) enteringTeam.change(() => solveReq.data)

                setDeletedReq(() => req);
            }catch(err){
                error.change(err?.response?.data?.error || err.message);
            }
        }
    }

    return (
        <div className='request-card-outer-container'>
            <span>
                <span>{req.from.username}</span> has invited you to the team <span>{req.team.name}</span>
            </span>

            <div className='buttons'>
                <button className='decline' style={{backgroundColor: 'var(--accent)'}} onClick={solveReq(false)}>
                    <i className='material-icons'>
                        close
                    </i>
                </button>


                <button className='accept' style={{backgroundColor: 'var(--secondary)'}} onClick={solveReq(true)}>
                    <i className='material-icons'>
                        check
                    </i>
                </button>
            </div>


        </div>
    )
}