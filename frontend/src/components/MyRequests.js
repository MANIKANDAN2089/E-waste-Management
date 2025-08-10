import React, { useState, useEffect } from 'react';

export default function MyRequests({ token, api }){
  const [pickups,setPickups] = useState([]);
  const [consults,setConsults] = useState([]);

  useEffect(()=>{
    const load = async ()=>{
      try {
        const r1 = await fetch(api+'/pickups/me', { headers:{ Authorization: 'Bearer '+token } });
        if (r1.ok) setPickups(await r1.json());
        const r2 = await fetch(api+'/consults/me', { headers:{ Authorization: 'Bearer '+token } });
        if (r2.ok) setConsults(await r2.json());
      } catch(e){ console.error(e); }
    };
    load();
  },[token,api]);

  return (<div><h4>Pickups</h4>{pickups.length? pickups.map(p=> (<div key={p._id} style={{border:'1px solid #ddd', padding:8, margin:8}}><b>{p.items}</b><div>Status: {p.status}</div><div>Address: {p.address}</div></div>)) : <div>No pickups</div>}<h4>Consults</h4>{consults.length? consults.map(c=> (<div key={c._id} style={{border:'1px solid #ddd', padding:8, margin:8}}><b>{c.category}</b><div>Status: {c.status}</div><div>{c.description}</div></div>)) : <div>No consults</div>}</div>)
}
