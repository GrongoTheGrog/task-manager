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
                    if (!teams[`${task.team?.name || 'Your own tasks'}`]){
                        teams[`${task.team?.name || 'Your own tasks'}`] = [task];
                    }else{
                        teams[`${task.team?.name || 'Your own tasks'}`].push(task)
                    }
                });

                console.log(teams)

                const components = [];

                for(let key in teams){
                    components.push(
                        <div className='section-tasks-container'>
                            <Link className='title-section' to={`/teams/${teams[key][0].teams}`}>{key}</Link>

                            <div className='tasks-flex'>
                                {key === 'Your own tasks' ? <CreateTask /> : null}
                                {teams[key].map(task => {
                                    return <TaskCard card={task}/>
                                })}
                            </div>

                        </div>
                    )
                }
                
                setTasks(() => components);
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

            <div className='all-cards-task-container'>
                {tasks ? tasks : <Loading />}
            </div>
        </section>
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
        <Link className='create-task-container' to={'/'}>
            <i className={'material-icons loading'}>
                add
            </i>
        </Link>
    )
}