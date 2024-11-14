import React, {useEffect, useMemo, useState} from 'react';
import {Carousel, Form, InputGroup} from 'react-bootstrap';
import Axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeHigh, faX } from '@fortawesome/free-solid-svg-icons'
import { useMapHook } from '../../context/map-provider';
import './index.css';


export default function Profile() {
    const {entity, setUid} = useMapHook();

    const [currentEntity, setCurrentEntity] = useState(null);
    const [images, setImages] = useState(null);

    useEffect(() => {
        if (entity && entity !== currentEntity) {
            var search = "";
			if("reg" in entity && entity.reg.length > 0) {
				search += entity.reg;
			} 
			if("type" in entity && entity.type.length > 0)
				if(search.length > 0)
					search += "+";
				search += entity.type;
            if(search.length > 0) {
                Axios.get(`http://localhost:8000/images/${search}`).then(res => {
                    console.log(res.data)
                    setImages(res.data);
                });
            }
            setCurrentEntity(entity)
        }
    }, [entity]);

    return (
    <div className="profile">
        <div className="close-profile">
            <FontAwesomeIcon icon={faX} onClick={() => setUid(null)}/>
        </div>
        {currentEntity &&
            <div>
                <h3>{currentEntity.icao}</h3>
                {images && images.length > 0 &&
                <Carousel
                    autoPlay={true}
                    interval={5000}
                    controls={false}
                    indicators={false}
                >
                    {images.map((image) => {
                        return (
                            <Carousel.Item>
                                <img src={image} width="300px"/>
                            </Carousel.Item>
                        );
                    }

                    )}
                </Carousel>
                }
                <div className="entity-info" style={{height: images && images.length > 0 ? "calc(100vh - 290px)" : "calc(100vh - 89px)"}}>
                    <ul>
                        {Object.entries(currentEntity).map(([k, v]) => {
                            return <li key={k}>{k.replace(/_/g, " ").toUpperCase()}: {v.toString().toUpperCase()}</li>
                        })
                        }
                    </ul>
                </div>
            </div>
        }
    </div>
    )
}