import { useSiteDefinitions } from '../../context/siteDefinitions';
import './createTask.css';
import { useParams } from 'react-router-dom'; 
import { useEffect, useRef, useState } from 'react';
import { set } from 'date-fns';
import { ca, da } from 'date-fns/locale';
import { Loading } from '../home/home';
import { Teams } from '../teams/teams';


export function CreateTask(){

    const definitions = useSiteDefinitions();


    const [teamData, setTeamData] = useState();
    const [selectedDate, setSelectedDate] = useState();
    const [selectedHour, setSelectedHour] = useState();

    const params = useParams();
    const team = params.team;

    useEffect(() => {
        if (team !== 'undefined'){
            const getData = async () => {
                try{
                    const response = await definitions.api.data.post('http://localhost:9000/getOneTeam', {
                        id: team
                    });
                    
                    console.log(response.data)
                    setTeamData(() => response.data);
                }catch(err){
                    definitions.error.change(err?.data?.error || err.message);
                }
            }
            getData();
        }
    }, [])


    return  teamData || team === 'undefined' ? <form className='outer-container-create-task-page'>

            <label style={{textAlign: 'center', fontSize: '28px', marginBottom: '10px'}}>
                {teamData?.name || 'Your own tasks'}
            </label>

            <div className='main-section-create-task'>
                <div className='basic'>
                    <div className='basic-together'>
                        <label htmlFor='name'>Name:</label>
                        <input className='input-create-task name' placeholder='E.g. new feature'/>
                    </div>

                    <div className='basic-together description'>
                        <label htmlFor='name'>Description:</label>
                        <textarea className='description' placeholder='E.g. add new feature'/>
                    </div>
                </div>

                <div className='specific'>

                    <label style={{marginBottom: '20px'}}>
                        Choose the deadline
                    </label>
                    <DatePicker change={setSelectedDate}></DatePicker>
                    <TimePicker change={setSelectedHour}/>
                    {selectedHour && selectedDate ? <span className='deadline-displayer'>
                        {selectedHour.hour}:{selectedHour.minutes}, {selectedDate.month + 1}/{selectedDate.day}/{selectedDate.year}
                    </span> :
                    null}
                </div>
            </div>

            {teamData && 
                    <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <label>
                        Who is making that task?
                    </label>
                    <To team={teamData}>
                    </To>
                </div>
            }

            <Tags>

            </Tags>

        </form> : <Loading />
}






///// DATE PICKER

function getCalendar(year, month){
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const calendar = [];

    for (let day = 1 - firstDay.getDay(); day <= lastDay.getDate() + (6 - lastDay.getDay()); day++){
        const date = new Date(year, month, day);

        calendar.push({
            year: date.getFullYear(), 
            month: date.getMonth(), 
            day: date.getDate(), 
            dayWeek: date.getDay()});
    }

    return calendar;
}

function DatePicker({value, change}){

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysComplete = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [day, setDay] = useState(new Date().getDate());
    const [calendar, setCalendar] = useState();
    const [picking, setPicking] = useState(false);

    function clickMonth(sum){
        return function(){
            if (month + sum >= 12){
                setYear(prev => prev + 1);
                setMonth(() => 0);
                return;
            }else if(month + sum < 0){
                setYear(prev => prev - 1);
                setMonth(() => 11);
                return
            }

            setMonth(prev => prev + sum)
        }
    }

    useEffect(() => {
        setCalendar(() => getCalendar(year, month));
    }, [month])


    function clickDay(day){
        return function(){
            setDay(day.day);
            setMonth(day.month);
            setYear(day.year)
            setPicking(() => false);
        }
    }
    
    useEffect(() => {
        change(() => ({
            year, 
            month, 
            day
        }))
    }, [year, month, day])

    return(
        <div className={`date-picker-container ${!picking ? 'picking' : ''}`} onClick={() => {
            if (!picking) {
                setPicking(() => true);
            }
        }}>
            <div className='info'>
                {picking && <div className='buttons'>
                    <button type='button' className='prev' onClick={clickMonth(-1)}>
                        <i className={'material-icons'}>
                            arrow_back_ios
                        </i>
                    </button>

                    <button type='button' className='next' onClick={clickMonth(1)}>
                        <i className={'material-icons'}>
                            arrow_forward_ios
                        </i>
                    </button>
                </div>}

                {!picking && <span className='calendar-icon-date-picker'>
                        <i className={'material-icons'}>
                            calendar_month
                        </i>
                    </span>}

                <div className='current'>
                    <span className='year'>
                        {year} 
                    </span>

                    <span className='month'>
                        {months[month]}, {day}
                    </span>
                </div>
            </div>

            {picking && <div className='calendar-container-picker'>
                {calendar && calendar.map((day, index) => {
                    return (
                        <div className={`day ${day.month !== month && 'not'}`} onClick={clickDay(day)} key={index}>
                            {day.day}
                        </div>
                    )
                })}
            </div>}
        </div>
    )
}



////TIME PICKER

function TimePicker({change}){

    const [picking, setPicking] = useState();
    const [time, setTime] = useState({
        ['hour']: new Date().getHours(),
        ['minutes']: 0
    });

    const hours = useRef([]);
    const minutes = useRef([]);

    useEffect(() => {
        hours.current = [];
        minutes.current = [];
        for(let c = 1; c <= 23; c++){
            let push = '' + c;
            if (c < 10){
                push = '0' + c;
            }
            hours.current.push(push);
        }

        for(let c = 0; c <= 55; c += 5){
            let push = '' + c;
            if (c < 10){
                push = '0' + c;
            }
            minutes.current.push(push);
        }

        setTime(prev => ({
            ...prev,
            minutes: minutes.current[0]
        }))
    }, [])

    useEffect(() => {
        change(() => time)
    }, [time.hour, time.minutes]);

    for(let key in time){
        if (time[key].length === 1){
            setTime(prev => ({
                ...prev,
                key: '0' + prev[key]
            }))
        }
    }

    return (
        <div className='time-container-picker' onClick={() => setPicking(prev => !prev)}>
            <i className={'material-icons'} style={{marginLeft: '10px'}}>
                schedule
            </i>

            <span style={{marginRight: '15px'}}>
                {time['hour']}:{time['minutes']} h
            </span>

            {picking && (
                <div className='absolute-time'>
                    <div className='complete-time hour'>
                        <span style={{color: 'var(--primary)', marginBottom: '10px'}}>
                            H
                        </span>
                        {hours.current.map(hour => {
                            return <div className='option-time' onClick={() => {setTime(prev => ({...prev, ['hour']: hour}))}}>{hour}h</div>
                        })}
                    </div>
                    <div className='complete-time hour'>
                        <span style={{color: 'var(--primary)', marginBottom: '10px'}}>
                            M
                        </span>
                        {minutes.current.map(minute => {
                            return <div className='option-time' onClick={() => {setTime(prev => ({
                                ...prev,
                                ['minutes']: minute
                            }))}}>{minute}m</div>
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}


function To({team}){

    const [to, setTo] = useState({});
    let list = team.members;
    list = list.sort((a, b) => {
        const aif = to[a.username] ? 1 : 0;
        const bif = to[b.username] ? 1 : 0;

        return bif - aif;
    } );


    function clickMemberTag(member, chosen){
        return function(){setTo(prev => {
            return {
            ...prev,
            [member.username]: chosen ? false : true
        }})}
    }

    console.log(to);
    
    
    return (
        <div className='to-container'>
            {list.map(member => {
                const chosen = to[member.username] === true ? true : false;
                console.log(chosen)

                return (
                    <div className={`to-tag ${chosen && 'active'}`} onClick={clickMemberTag(member, chosen)}>
                        <span>{member.username}</span>

                        <i className='material-icons'>
                            {chosen ? 'person_remove' : 'person_add'}
                        </i>
                    </div>
                )
            })}
        </div>
    )
}



function Tags(){

    const [tags, setTags] = useState();

    return (
        <div className='tag-container-create-task'>
            
        </div>
    )
}

function Tag(){

}