import { useSiteDefinitions } from '../../context/siteDefinitions';
import './createTask.css';
import { data, useParams } from 'react-router-dom'; 
import { useEffect, useRef, useState } from 'react';
import { set, setDate } from 'date-fns';
import { ca, da } from 'date-fns/locale';
import { Loading } from '../home/home';
import { Teams } from '../teams/teams';


export function CreateTask({update}){

    const definitions = useSiteDefinitions();

    //team data
    const [teamData, setTeamData] = useState();

    //task data
    const [taskData, setTaskData] = useState();

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

    //priority
    const [currentPriority, setCurrentPriority] = useState({Medium: 50});

    //status for updating
    const [currentStatus, setCurrentStatus] = useState();

    const params = useParams();

    const team = params.team;


    //force a deafult possible priorities (not proud of that at all)
    useEffect(() => {
        if (team === 'undefined') setTeamData(prev => ({
                ...prev,
                possiblePriorities: {
                    Urgent: 100,
                    ['Very High']: 87,
                    High: 75,
                    Medium: 50,
                    Low: 25,
                    ['Very Low']: 17
                }
        }))
    }, [])


    //create/update task api interaction
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
        if (date.getTime() < new Date().getTime() &&  !update) return definitions.error.change('Select an available date.')  

        const newTask = {
            name: taskNameInput, 
            description: taskDescriptionInput,
            deadline: date,
            team: teamData._id,
            tags,
            to: selectedMembers.map(member => {
                return member._id
            }),
            priority: currentPriority,
            status: currentStatus
        }
    
        try{   
            if (update) {
                const update = await definitions.api.data.post('/edittask', {
                    ...newTask,
                    id: taskData?._id
                })
            }else{
                const create = await definitions.api.data.post('/createtask', newTask);
            }
            
    
    
            window.history.back();
        }catch(err){
            definitions.error.change(err?.response.data.error || err.message);
        }
    }

    //set query members
    useEffect(() => {

        const queryMembers = members.filter(member => {

            if (selectedMembers.find(memberFind => memberFind._id === member._id)) {
                return;
            };

            return member.username.slice(0, inputQuery.trim().length) === inputQuery.trim();
        })

        setQueryMembers(queryMembers);
    }, [inputQuery, selectedMembers, members])

    //get the task data
    useEffect(() => {
        if(params?.task){
            async function getData(){
                try{
                    const taskId = params.task;
                        const task = await definitions.api.data.post('/getTaskById', {
                            taskId,
                        });

                        //set the task data
                        setTaskData(task.data);

                        //set the current selected members
                        setSelectedMembers(task.data.to);

                        //set the current name and description
                        setTaskNameInput(task.data.name);

                        //set the current task description
                        setTaskDescriptionInput(task.data.description);

                        //set the current task priority
                        setCurrentPriority(task.data.priority);

                        //set tags 
                        setTags(task.data.tags)

                        //set status
                        setCurrentStatus(task.data.status);
        
                }catch(err){
                    definitions.error.change(err?.response?.data.error || err.message);
                }
            }
            getData();
        }
    }, [])



    //get the team data and set members only if team is not undefined
    useEffect(() => {
        if (team !== 'undefined'){
            const getData = async () => {
                try{
                    const response = await definitions.api.data.post('http://localhost:9000/getOneTeam', {
                        id: team
                    });

                    setTeamData(() => response.data);
                    setMembers(response.data.members.map(member => {
                        return member.user;
                    }))
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

    

    return  teamData ? 
        <div className='outer-container-create-task-page'> 
            <div className='inner-container-create-task-page'>
                <div className='create-task-section first'>
                    <div className='info'>
                        <span className='team'>
                            {teamData?.name || 'My Own Tasks'}
                        </span>
                        <span className='assign'>
                            {update ? 'update task' : 'assign task'}
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
                    <div className='basic-info-outer-container'>
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

                        <div className='priority-container'>
                            <span>
                                Select the priority
                            </span>

                            <div className='priority-picker-container'>
                                {teamData.possiblePriorities ?
                                Object.keys(teamData.possiblePriorities).map(priority => {
                                    const pr = teamData.possiblePriorities[priority];

                                    let cl = '';
                                    if (Object.keys(currentPriority)[0] === priority) cl = ' active';

                                    return (
                                        <div 
                                            className={'priority-option' + cl}
                                            onClick={(event) => {setCurrentPriority({
                                                [priority]: pr
                                            })}}
                                        >
                                            {priority}
                                        </div>
                                    )
                                }) : 
                                null}
                            </div>
                        </div>

                        {update ?
                            <div className='status-outer-container-update'>
                                <span>
                                    Status
                                </span>

                                <div className='status-option-update-container'>
                                    {[
                                        'Todo',
                                        'In Progress',
                                        'Done',
                                        'Aproved'
                                    ].map(status => {
                                        const current = status === currentStatus ? 
                                        status : '';
                                        return (
                                            <div 
                                                className={'status-option-update ' + current}
                                                onClick={() => setCurrentStatus(status)}
                                            >
                                                {status}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div> :
                        null}
                    </div>

                    <div className='extra-info-container'>
                        <div className='duedate-container-assign'>
                            <span className='title'>
                                Duedate
                            </span>

                            <span className='time-displayer'>

                            </span>

                            <TimePicker change={setSelectedHour} timeProp={taskData?.deadline}/>
                            <DatePicker change={setSelectedDate} timeProp={taskData?.deadline}/>
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
                    {update ? 'Update task' : 'Assign Task'}
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
                {member?.username}
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

function DatePicker({timeProp, change}){

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const daysComplete = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [month, setMonth] = useState(new Date().getMonth() );
    const [year, setYear] = useState(new Date().getFullYear());
    const [day, setDay] = useState(new Date().getDate());
    const [calendar, setCalendar] = useState();
    const [picking, setPicking] = useState(false);

    useEffect(() => {
        function click(){
            setPicking(false);
        };  

        document.addEventListener('click', click)

        return () => document.removeEventListener('click', click);
    }, [])


    useEffect(() => {
        if (timeProp){
            setMonth(new Date(timeProp).getMonth());
            setYear(new Date(timeProp).getFullYear());
            setDay(new Date(timeProp).getDate());
        }
    }, [timeProp])

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
        <div className={`date-picker-container`} onClick={(e) => {
            e.stopPropagation();
            setPicking(prev => !prev)
        }}>
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

function TimePicker({change, timeProp}){

    const [picking, setPicking] = useState(false);
    const [time, setTime] = useState({
        ['hour']: new Date().getHours(),
        ['minutes']: new Date().getMinutes()
    });

    useEffect(() => {
        function click(){
            setPicking(false);
        };  

        document.addEventListener('click', click)

        return () => document.removeEventListener('click', click);
    }, [])

    const hours = useRef([]);
    const minutes = useRef([]);

    useEffect(() => {
        if (timeProp){
            setTime({
                ['hour']: new Date(timeProp).getHours(),
                ['minutes']: new Date(timeProp).getMinutes()
            });

        }
    }, [timeProp])

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

    console.log(time['minutes']);

    return (
        <div className='time-container-picker' onClick={(e) => {
            e.stopPropagation()
            setPicking(prev => !prev);
        }}>
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