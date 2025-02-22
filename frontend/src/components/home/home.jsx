import { useEffect, useState } from 'react';
import './home.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Link } from 'react-router-dom';
import { format, subMilliseconds } from 'date-fns';

export function Home(){

    const [tasks, setTasks] = useState();
    const [teams, setTeams] = useState();

    const definitions = useSiteDefinitions();
    const api = definitions.api.data;

    useEffect(() => {
        const getData = async () => {
            try{
                const tasks = await api.post('http://localhost:9000/gettasksauthor');
                setTasks(tasks.data);
                const teams = await api.get('http://localhost:9000/getteam');
                setTeams(teams.data);  
            }catch(err){
                definitions.error.change(err.message)
            }
        };
        getData();
    }, []);

    console.log(teams)

    return(
        <section className='home-main-container'>
            <span className='span-home-main-outer'>Feeling productive today?</span>


            <div className='home-cards-container'>
                <div className='home-card home-card-tasks'>
                    <span className='home-card-title home-card-title-tasks'>
                        Your Tasks
                    </span>

                    {tasks ? tasks.slice(0, 2).map((task, index) => {
                        return <CardTask card={task} key={index}/>
                        }) : <Loading />
                    }

                    <Link to='/tasks' className='link-card'>See more...</Link>
                        
                </div>

                <div className='home-card home-card-teams'>
                    <span className='home-card-title home-card-title-tasks'>
                        Your Teams
                    </span>

                    {teams ? teams.slice(0, 2).map((task, index) => {
                        return <CardTeam card={task} key={index}/>
                        }) : <Loading />
                    }


                    <Link to='/teams' className='link-card'>See more...</Link>
                </div>
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



function CardTask({card}){

    return(
        <div className='home-inner-card' id={card._id}>
            <div className='title-inner-card-task'>
                <span style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)'}}>
                    {card.name}
                </span>

                {card.team && <span style={{fontSize: '16px', fontWeight: 'bold'}}>
                    {card.team.name}
                </span>}
            </div>

            <span className='tasks-description-card'>
                {card.description}
            </span>

            <div className='tags-container-tasks-home'>
                {card.tags.map((tag, index) => {
                    return <span className='tag-card-tasks-home' key={index}>{tag} </span>
                })}
            </div>

            {card.deadline && <div className='dead-line-card-home'>
                <strong>Deadline:</strong> {remainingTime(new Date(card.deadline).getTime() - new Date().getTime())}
            </div>}
        </div>
    )
}

function CardTeam({card}){
    return (
        <div className='home-inner-card' id={card._id}>
                <div className='title-inner-card-task'>
                <span style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)'}}>
                    {card.name}
                </span>
            </div>

            <span className='tasks-description-card'>
                {card.description}
            </span>
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