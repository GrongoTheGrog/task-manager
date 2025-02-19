import { useEffect, useState } from 'react';
import './tasks.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { set } from 'date-fns';
import { Loading } from '../home/home';
import { Link } from 'react-router-dom';
import { remainingTime } from '../home/home';

export function Tasks(){

    const definitions = useSiteDefinitions();

    const [tasks, setTasks] = useState();

    useEffect(() => {
        const getData = async () => {
            try{
                const response = await definitions.api.data.post('http://localhost:9000/gettasksauthor');

                const teams = {
                    ['Your own tasks']: []
                };


                response.data.forEach(task => {
                    if (!teams[`${task.team?._id || 'Your own tasks'}`]){
                        teams[`${task.team?._id || 'Your own tasks'}`] = [];
                    }
                    teams[`${task.team?._id || 'Your own tasks'}`].push(task)
                });

                console.log(teams)

                setTasks(() => teams);
                
            }catch(err){
                definitions.error.change(err?.data?.error || err.message)
            }
        }
        getData();
    }, [])
    
    return (
        <section className='tasks-container-tasks'>
            <span className='tasks-title-tasks'>
                Tasks
            </span>

                {!tasks && <Loading />}

                <div className='all-cards-task-container'>
                    <div className='container-tasks1 cont'>
                    </div>
                    <div className='container-tasks2 cont'>
                    </div>
                    <div className='container-tasks3 cont'>
                    </div>
                </div>

                {tasks && Object.keys(tasks).map(key => {
                    return <RenderTasks team={tasks[key]} keyCont={key}/>
                })}
        </section>
    )
}

function RenderTasks({team, keyCont}){

        useEffect(() => {
            const conts = document.querySelectorAll('.container-tasks1, .container-tasks2, .container-tasks3');
            console.log(conts[0].offsetHeight);
            console.log(conts[1].offsetHeight);
            console.log(conts[2].offsetHeight);
    
            let min = conts[0];

    
            conts.forEach(cont => {
                if (cont.offsetHeight < min.offsetHeight) min = cont;
            })

    
            min.appendChild(document.getElementById(keyCont))
        }, [])

        const teamName = team[0]?.team?.name || "Your own tasks";

        return (
            <div className='section-tasks-container' id={keyCont}>
                <Link className='title-section' to={`/teams/${teamName}`}>{teamName}</Link>


                <div className='tasks-flex'>
                    {keyCont === 'Your own tasks' ? <CreateTask /> : null}
                    {team.map(task => {
                        return <TaskCard card={task}/>
                    })}
                </div>

            </div>
    )
}

function TaskCard({card}){
    return (
        <div className='home-inner-card' key={card._id}>
            <div className='title-inner-card-task'>
                <span style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)'}}>
                    {card.name}
                </span>
            </div>

            <span className='tasks-description-card'>
                {card.description}
            </span>

            <div className='tags-container-tasks-home'>
                {card.tags && card.tags.map((tag, index) => {
                    return <span className='tag-card-tasks-home' key={index}>{tag} </span>
                })}
            </div>

            {card.deadline && <div className='dead-line-card-home'>
                <strong>Deadline:</strong> {remainingTime(new Date(card.deadline).getTime() - new Date().getTime())}
            </div>}
        </div>
    )
}

function CreateTask(){
    return (
        <Link className='create-task-container' to={'/createTasks/undefined'}>
            <i className={'material-icons loading'}>
                add
            </i>
        </Link>
    )
}