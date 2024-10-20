import React, { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

interface FormData {
  username: string;
  roomnumber: string;
}

const App: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const onSubmit = (data: FormData) => {
    console.log("Login Sucessful");
    console.log(data);
    navigate(`/room/${data.roomnumber}`, { state: { username: data.username } });
  };

  const showError = (message: string) => {
    if (toast.current) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: message, life: 3000 });
    }
  };

  const onError = () => {
    if (errors.username) showError(errors.username.message || 'Email is required');
    if (errors.roomnumber) showError(errors.roomnumber.message || 'Password is required');
  };

  return (
    <div className="login-container">
      <Toast ref={toast} />
      <div className="login-box">
        <h1>YouTube Together</h1>
        <h3>Welcome Back</h3>
        <p>Fill in the form to continue</p>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="p-field">
            <label htmlFor="username">Username</label>
            <Controller
              name="username"
              control={control}
              defaultValue=""
              rules={{ required: 'Username is required'}}
              render={({ field }) => <InputText id="username" {...field} />}
            />
          </div>
          <div className="p-field">
            <label htmlFor="roomnumber">Room Number</label>
            <Controller
              name="roomnumber"
              control={control}
              defaultValue=""
              rules={{ required: 'Room Number is required', pattern: { value: /^[0-9]+$/, message: 'Room Number must be a number' } }}
              render={({ field }) => <InputText id="roomnumer" type="text" {...field} />}
            />
          </div>
          <Button type="submit" label="Join" icon="pi pi-check" />
        </form>
      </div>
    </div>
  );
};

export default App;