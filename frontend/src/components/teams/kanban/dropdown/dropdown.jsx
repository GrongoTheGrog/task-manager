import { useEffect, useRef, useState } from 'react';
import './dropdown.css';

export function Dropdown({list, change, label}){

    const [current, setCurrent] = useState(0);
    const [setting, setSetting] = useState(false);
    const container = useRef();

    function click(item, index){
        return function(e){
            setCurrent(index);
            change(item.value);
            setSetting(false);
        }
    }

    const translate = current * -(100 / list.length);
    const addingPixels = current * 3;                   //cause theres three

    useEffect(() => {
        function click(e){
            if (!container.current.contains(e.target)){
                setSetting(false)
            }
        };

        document.addEventListener('click', click);

        return () => document.removeEventListener('click', click);
    }, [])
    
    return(
        <div style={{position: 'relative'}}>
            {
            label ?
            <span className='label-dropdown-filter'>
                {label}
            </span> :
            null
            }

            <div
                className={'dropdown-outer-container ' + (!setting ? 'active' : '')}
                ref={container}
                >

                <div
                    className='dropdown-inner-flex'
                >
                        <div
                            className={'dropdown-item'}
                            onClick={(e) => setSetting(prev => !prev)}
                            style={{boxShadow: 'none', marginBottom: '5px'}} 
                        >
                            <span>{list[current].label}</span>
                            <i className='material-icons'>
                                {setting ?
                                    'arrow_drop_up' :
                                    'arrow_drop_down'}
                            </i>
                        </div>
            
                    {list.map((item, index) => {
                        let cl = false;
                        if (index === current) {
                            cl = true;
                        }
            
                        return (
                            <div
                                className={'dropdown-item ' + (cl ? 'active' : '')}
                                onClick={click(item, index)}
                            >
                                <span>{item.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}