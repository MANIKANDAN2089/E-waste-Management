import React, { useState } from 'react';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Register({ onAuth }){
  const [form,setForm] = useState({
    name:'',
    email:'',
    password:'',
    role:'user',
    adminCode:''
  });
  const [msg,setMsg] = useState('');
  const submit = async (e)=>{
    e.preventDefault();
    const res = await fetch(API+'/auth/register',{method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(form)});
    const data = await res.json();
    if(res.ok){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); onAuth(data.token, data.user); }
    else setMsg(data.error || 'Error');
  };
  return (
    <form onSubmit={submit}>
      <h3>Register</h3>
      <input 
        placeholder='Name' 
        value={form.name} 
        onChange={e=>setForm({...form,name:e.target.value})} 
        required 
      />
      <input 
        placeholder='Email' 
        value={form.email} 
        onChange={e=>setForm({...form,email:e.target.value})} 
        required 
      />
      <input 
        placeholder='Password' 
        type='password' 
        value={form.password} 
        onChange={e=>setForm({...form,password:e.target.value})} 
        required 
      />
      <select 
        value={form.role} 
        onChange={e=>setForm({...form,role:e.target.value})}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      {form.role === 'admin' && (
        <input
          placeholder='Admin Code'
          type='password'
          value={form.adminCode}
          onChange={e=>setForm({...form,adminCode:e.target.value})}
        />
      )}
      <button>Register</button>
      <div style={{color:'red'}}>{msg}</div>
    </form>
  )
}
