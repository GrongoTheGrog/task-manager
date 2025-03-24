import { useEffect, useRef, useState } from 'react';
import './calendar.css';
import { Loading } from '../home/unloggedHome/home';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { format } from 'date-fns';

export function Calendar(){

    const definitions = useSiteDefinitions();

    const formatingTime = 'yyyy/MM/dd';
    
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [calendar, setCalendar] = useState(null);
    const today = new Date();
    const [currentDay, setCurrentDay] = useState({
        date: new Date()
    });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysComplete = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [tasks, setTasks] = useState();

    function clickDay(info){
        return function () {
            console.log('click')
            setCurrentDay(() => info)
        }
    }
    
    useEffect(() => {
        const getData = async () => {
            try{
                const response = await definitions.api.data.post('http://localhost:9000/gettasksauthor');
                
                const tasks = {};

                console.log(response.data)

                response.data.forEach((task) => {
                    if (task?.deadline){
                        const deadline = new Date(task.deadline);
                        const key = `${format(new Date(deadline), formatingTime)}`;
                        if (!tasks[key]){
                            tasks[key] = [task];
                        }else{
                            tasks[key].push(task)
                        }
                    }
                });

                setCurrentDay(() => ({
                    date: new Date(),
                    tasks: tasks[`${format(new Date(), formatingTime)}`] || []
                }))

                console.log(tasks)

                setTasks(() => tasks);
            }catch(err){
                definitions.error.change(err.message)
            }
        };
        getData()
    }, [])


    useEffect(() => {

        setCalendar(() => getCalendar(year, month));
        
    }, [month, year]);

    function changeMonth(sum){
        return function () {

            const calendarDOM = document.querySelector('.calendar-outer-container');
            let currentYear = year;

            setMonth(prev => {
                if (prev + sum > 11){
                    currentYear += 1;
                    return 0;
                };
                if (prev + sum < 0){
                    currentYear -= 1;
                    return 11;
                }

                return prev + sum;
            });

            setYear(() => currentYear)
        }
    }

    return (
        <section className='calendar-main'>
            <span className='title-agenda'>
                Agenda
            </span>

            <div className='container-calendar-info'>
                {!tasks ? <Loading /> : <div className='calendar-outer-container'>
                
                    <div className='header-calendar'>
                        <div className='time-display'>
                            <span>
                                {year}
                            </span>
                            <span>
                                {months[month]}
                            </span>
                        </div>
                        <div className='buttons-calendar'>
                            <button className='calendar-button calendar-next' onClick={changeMonth(-1)}>
                                prev
                            </button>
                            <button className='calendar-button calendar-prev' onClick={changeMonth(1)}>
                                next
                            </button>
                        </div>
                    </div>
                    <div className='calendar-main-container'>
                        {days.map(day => <span className='week-label'>{day}</span>)}
                        {!calendar ? <Loading /> :
                            calendar.map((day, index) => {

                                let clDiv = 'day-container-calendar';
                                let clSpan = 'day-label-number';
                                const date = new Date(day.year, day.month, day.dayNumber);
                                const key = `${format(date, formatingTime)}`;
                                const current = new Date(currentDay.date);
                                const currentDate = current.getDate();
                                const currentMonth = current.getMonth();
                                const currentYear = current.getFullYear();

                                const currentClass = currentDate === date.getDate() && currentMonth === date.getMonth() && date.getFullYear() === currentYear ? ' current' : '';
                                
                                const inDateTasks = tasks[key]


                                if (year === today.getFullYear() && today.getDate() === day.dayNumber && date.getMonth() === today.getMonth()) {
                                    clDiv += ' bright';
                                    clSpan += ' bright';
                                }


                                return (
                                    <div className={`${clDiv} ${day.month !== month ? ' not-month' : ''} ${currentClass}`} onClick={clickDay({
                                        date,
                                        tasks: inDateTasks || []
                                    })}>
                                        <span className={clSpan}>{day.dayNumber}</span>
                
                                        <div className='tasks-tokens-container'>
                                            {inDateTasks && inDateTasks.map(task => {
                                                return (<div className='tasks-token'>
                                            </div>)
                                        })}
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>}
                <div className='current-day-main-container'>
                        {currentDay && 
                            <div className='inner-current-container'>
                                <div className='current-date-info'>
                                    <span className='day-week'>
                                        {daysComplete[currentDay.date.getDay()]}

                                        <span style={{fontSize: '14px'}}>
                                        {currentDay.date.getFullYear()}
                                    </span>
                                    </span>
                                    <span className='month'>
                                        {months[currentDay.date.getMonth()]}, {currentDay.date.getDate()}
                                    </span>
                                </div>

                                {!currentDay.tasks ? <Loading /> : 
                                    currentDay.tasks.length === 0 ?
                                        <div className='warning-current'>
                                            <i className={'material-icons'}>event_busy</i>
                                            <span>No tasks for that day</span>
                                        </div>:

                                        <div className='tasks-container-current'>
                                            {currentDay.tasks.map(task => {
                                                return (
                                                    <CardTask card={task} />
                                                )
                                            })}
                                        </div>
                                }
                            </div>
                        }
                </div>
            </div>
        </section>

    )
}



function getCalendar(year, month){
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Tur', 'Fri', 'Sat']
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const calendar = [];

    for (let day = 1 - (firstDay.getDay()); day <= lastDay.getDate() + (6 - lastDay.getDay()); day++){
        let realDay = day;
        let realMonth = month;
        if (day > lastDay.getDate()) {
            realDay = day - lastDay.getDate(); 
            realMonth += 1;
        };
        const date = new Date(year, realMonth, realDay);


        calendar.push({year: date.getFullYear(), month: date.getMonth(), dayWeek: days[date.getDay()], dayNumber: date.getDate()})
    };

    return calendar;
}


function CardTask({card}){


    return (
        <div className='task-current-card'>
            <span className='current-card-title'>
                {card.name}
                {card.team && <span className='team'>
                    {card.team.name}
                </span>}
            </span>

            <span className='description'>
                {card.description}
            </span>

            <div className='tags-container'>
                {card.tags && card.tags.map((tag, index) => (
                    <div className='tag' key={index}>
                        {tag}
                    </div>
                ))}
            </div>

            <span className='end-time'>
                until {format(new Date(card.deadline), 'HH:mm')}h
            </span>
        </div>  
    )
}