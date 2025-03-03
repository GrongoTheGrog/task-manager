import { useSiteDefinitions } from '../../context/siteDefinitions';
import './createTask.css';
import { data, useParams } from 'react-router-dom'; 
import { useEffect, useRef, useState } from 'react';
import { set, setDate } from 'date-fns';
import { ca, da } from 'date-fns/locale';
import { Loading } from '../home/home';
import { Teams } from '../teams/teams';


export function CreateTask(){

    const definitions = useSiteDefinitions();

    //team data
    const [teamData, setTeamData] = useState();

    //controled input for query
    const [inputQuery, setInputQuery] = useState('');

    //members 
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [queryMembers, setQueryMembers] = useState([]);

    //info inputs
    const [taskNameInput, setTaskNameInput] = useState('');
    const [taskDescriptionInput, setTaskDescriptionInput] = useState('');

    //create tags
    const [inputTag, setInputTag] = useState('');
    const [creatingTag, setCreatingTag] = useState();
    const [tags, setTags] = useState([]);

    //time and date
    const [selectedDate, setSelectedDate] = useState();
    const [selectedHour, setSelectedHour] = useState();



    const params = useParams();
    const team = params.team;
    console.log(selectedMembers)

    //create task api interaction

    async function createTaskApi(){
        if (taskNameInput.trim() === '') return definitions.error.change('Enter the task name');
        if (taskDescriptionInput.trim() === '') return definitions.error.change('Enter the description.');

        const date = new Date(
            selectedDate.year,
            selectedDate.month,
            selectedDate.day,
            selectedHour.hour,
            selectedHour.minutes
        );
        if (date.getTime() < new Date().getTime()) return definitions.error.change('Select an available date.')  
        try{
            const create = await definitions.api.data.post('/createtask', {
                name: taskNameInput, 
                description: taskDescriptionInput,
                deadline: date,
                team: teamData._id,
                tags,
                to: selectedMembers.map(member => {
                    console.log(member);
                    return member.user._id
                })
            });
    
    
            window.history.back();
        }catch(err){
            definitions.error.change(err?.response.data.error || err.message);
        }
    }


    //set query members
    useEffect(() => {
        const queryMembers = members.filter(member => {
            if (selectedMembers.includes(member)) return false;

            return member.user.username.slice(0, inputQuery.trim().length) === inputQuery.trim();
        })

        console.log(queryMembers)

        setQueryMembers(() => queryMembers);
    }, [inputQuery, selectedMembers, members])

    
    async function CreateTaskApi(event){
        event.preventDefault();

        const {year, month, day} = selectedDate;
        const {hour, minutes} = selectedHour;

        const data = new FormData(event.target);
        const name = data.get('name');
        const description = data.get('description');
        const date = new Date(year, month, day, hour, minutes)
        if (new Date() - date > 0) return definitions.error.change('Select an available time.')
        const toArray = [];
        


        if (!name || !description) return definitions.error.change('Both name and description are required.');


        try{
            const create = await definitions.api.data.post('http://localhost:9000/createtask', {
                name,
                description, 
                tags,
                to: toArray,
                deadline: date,
                ...(team !== 'myOwn' && team ? {team} : {})
            })

            window.history.back();
        }catch(err){
            definitions.error.change(err?.data.error || err.message);
        }
        

    }


    //get the team data and set members only if team is not undefined
    useEffect(() => {
        if (team !== 'undefined'){
            const getData = async () => {
                try{
                    const response = await definitions.api.data.post('http://localhost:9000/getOneTeam', {
                        id: team
                    });

                    setTeamData(() => response.data);
                    setMembers(response.data.members)
                }catch(err){
                    definitions.error.change(err?.data?.error || err.message);
                }
            }
            getData();
        }
    }, [])

    useEffect(() => {

        function handleClick(event){
            setCreatingTag(false);
            setInputTag('');
        }

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [])

    console.log(selectedMembers);

    return  teamData || team === 'undefined' ? 
        <div className='outer-container-create-task-page'> 
            <div className='inner-container-create-task-page'>
                <div className='create-task-section first'>
                    <div className='info'>
                        <span className='team'>
                            {teamData?.name || 'My Own Tasks'}
                        </span>
                        <span className='assign'>
                            assign task
                        </span>
                    </div>


                    <div className='select-members-outer-container scrollbar'>
                        <span>
                            Assign task to users
                        </span>

                        <div className='input-search-create-container'>
                            <input 
                                className='search-members-assign' 
                                placeholder='Search users'
                                value={inputQuery}
                                onChange={(event) => setInputQuery(event.target.value)}
                                >

                            </input>

                            <button onClick={() => setInputQuery('')}>
                                <i className='material-icons'>
                                    {inputQuery.length ? 
                                    'close' : 
                                    'search'}
                                </i>
                            </button>
                        </div>

                        {selectedMembers.length ? 'Assigned member(s):' : ''}

                        <div className='selected-users-container' style={{marginBottom: '10px'}}>
                        {selectedMembers.length ? selectedMembers.map((member, index) => {

                            return (
                                <MemberQueryCard 
                                setSelectedMembers={setSelectedMembers} 
                                setQueryMembers={setQueryMembers}
                                member={member}
                                selected={true}
                                key={index}
                                /> 
                            )

                            }) : 

                            null} 
                        </div>

                        {queryMembers.length ? 'Results:' : ''}

                        <div className='available-users-container' style={{height: '100%'}}>
                            {queryMembers.length ? queryMembers.map((member, index) => {

                                const selected = selectedMembers.includes(member);

                                return (
                                    <MemberQueryCard 
                                    setSelectedMembers={setSelectedMembers} 
                                    setQueryMembers={setQueryMembers}
                                    member={member}
                                    selected={selected}
                                    key={index}
                                    /> 
                                )
                                
                            }) : 
                            
                            <div className='no-members-found'>
                                No members found
                            </div>} 
                        </div>
                    </div>
                </div>

                <div className='create-task-section second'>
                    <div className='basic-info-container'>
                        <span>
                            Name
                        </span>
                        <input 
                            value={taskNameInput}
                            onChange={(event) => setTaskNameInput(event.target.value)}
                            placeholder='Enter the task name'
                            >

                        </input>

                        <span>
                            Description:
                        </span>

                        <textarea
                            className='scrollbar'
                            value={taskDescriptionInput}
                            onChange={(event) => setTaskDescriptionInput(event.target.value)}
                            placeholder='Enter the task description'
                            >

                        </textarea>
                    </div>

                    <div className='extra-info-container'>
                        <div className='duedate-container-assign'>
                            <span className='title'>
                                Duedate
                            </span>

                            <span className='time-displayer'>

                            </span>

                            <TimePicker change={setSelectedHour}/>
                            <DatePicker change={setSelectedDate}/>
                        </div>

                        <div className='tags-container-assign'>
                            <span>
                                Labels
                            </span>

                            {!creatingTag ?
                                <div 
                                    className='box-creating-tag'
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setCreatingTag(() => true)
                                    }}
                                >
                                    <span>
                                        Create Tag
                                    </span>
                                    <i className='material-icons'>
                                        add
                                    </i>
                                </div> :
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <input
                                        autoFocus
                                        className='input-creating-tag'
                                        value={inputTag}
                                        onChange={(event) => {
                                            setInputTag(event.target.value);
                                        }}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                if(inputTag.trim() === '') return definitions.error.change('Enter a tag name.')
                                                setCreatingTag(() => false);
                                                setTags(prev => [...prev, inputTag]);
                                                setInputTag('');
                                            }
                                        }}
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                    </input>

                                    <div 
                                        className='button-add-tag'
                                        onClick={(event) => {
                                            if(inputTag.trim() === '') return definitions.error.change('Enter a tag name.')
                                            setCreatingTag(false);
                                            setTags(prev => [...prev, inputTag]);
                                            setInputTag('');
                                        }}
                                    >
                                        <i className='material-icons'>
                                            add
                                        </i>
                                    </div>
                                </div>
                            }

                                <div 
                                    className='tags-container-tags'
                                >
                                        {tags ? 
                                        tags.map(tag => {
                                            return (
                                                <div className='tag'
                                                >
                                                    <span>{tag}</span>
                                                    <i className='material-icons'
                                                        onClick={() => setTags(prev => prev.filter(tag1 => tag1 !== tag))}>
                                                        close
                                                    </i>
                                                </div>
                                            )
                                        }) :
                                        null}
                                </div>  

                        </div>
                    </div>
                </div>
            </div>

            <div className='buttons'>
                <button 
                    style={{backgroundColor: 'var(--accent)'}}
                    onClick={() => window.history.back()}
                    >
                    Cancel
                </button>

                <button style={{backgroundColor: 'var(--secondary)'}} onClick={createTaskApi}>
                    Assign Task
                </button>
            </div>
        </div>    
        : <Loading />
}


function MemberQueryCard({setSelectedMembers, setQueryMembers, member, selected, key}){

    function click(){
        if (selected) {
            setQueryMembers(prev => [...prev, member])
            setSelectedMembers(prev => prev.filter(memberFilter => memberFilter !== member));
        }else {
            setQueryMembers(prev => prev.filter(memberFilter => memberFilter !== member))
            setSelectedMembers(prev => {
                if (prev.includes(member)) return prev;
                
                return [...prev, member];
            })
        }
    }

    return (
        <div className='member-query-outer-card' key={key}>
            <div className={'checkbox-container' + (selected ? ' selected' : '')} onClick={click}>
                {selected ? 
                <i className='material-icons' style={{fontSize: '16px'}}>
                    check
                </i> : 
                null}
            </div>
            <div className={'member-query-card' + (selected ? ' selected' : '')}>
                {member.user.username}
            </div>
        </div>
    )
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
        return function(event){
            event.stopPropagation();
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
        return function(event){
            event.stopPropagation();
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
        <div className={`date-picker-container`} onClick={() => setPicking(prev => !prev)}>
                <span className='calendar-icon-date-picker'>
                        <i className={'material-icons'}>
                            calendar_month
                        </i>
                    </span>

                <div className='current'>
                    <span className='month'>
                        {year} {months[month]}, {day}
                    </span>
                </div>


                {picking && <div className='absolute-calendar' onClick={(event) => event.stopPropagation()}>
                    <div className='info'>
                        <div className='buttons'>
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
                        </div>

                        <span>
                            {year}, {months[month]}, {day}
                        </span>
                    </div>
    
                    <div className='calendar-container-picker'>
                        {calendar && calendar.map((dayMap, index) => {

                            const picked = 
                            dayMap?.day === day &&
                            dayMap?.month === month &&
                            dayMap?.year === year ?
                            ' picked' : 
                            '';

                            return (
                                <div className={`day ${dayMap.month !== month && 'not'} ${picked}`} onClick={clickDay(dayMap)} key={index}>
                                    {dayMap.day}
                                </div>
                            )
                        })}
                    </div>
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