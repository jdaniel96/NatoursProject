/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (response.data.status === 'success') {
      showAlert('success', 'logged in succesfully');
    }
  } catch (err) {
    // alert(err);
    // showAlert('error', err.response.data.message);
    console.log(err);
  }
};

export const logout = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (response.data.status === 'success') {
      // location.reload(true); //reload the page AND THE SERVER
    }
  } catch (err) {
    showAlert('error', 'Error logging out!');
  }
};
