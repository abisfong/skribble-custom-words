// jshint esversion: 9
const list = document.querySelector('.list');
const duplicateEntry = document.querySelector('.list__item--duplicate-entry');
const difficultyInput = document.querySelector('.input--difficulty');
const difficultySelection = document.querySelector('.difficulty-selection');
const difficultyArrows = document.getElementsByClassName('arrow-container');
const logoutBtn = document.querySelector('.nav__el--logout');
const loginForm = document.querySelector('.form--login');
const passwordChangeForm = document.querySelector('.form--password-change');
const signupForm = document.querySelector('.form--signup');
const userInfoForm = document.querySelector('.form--user-info');
const username = document.getElementById('username');
const yourList = document.querySelector('.h1--your-list-title');
var selection = 0;
var timerId;

// FUNCTIONS

const changeColor = function(dir) {
  if(dir == 'prev')
    selection = selection - 1 >= 0 ? selection - 1 : 2;
  else
    selection = (selection + 1) % 3;

  if(selection == 0) {
    difficultySelection.style.backgroundImage = 'linear-gradient(to right, #50c878, #39ff14)';
    difficultyInput.value = 'easy';
  } else if(selection == 1) {
    difficultySelection.style.backgroundImage = 'linear-gradient(to right, #fff200, #fff200)';
    difficultyInput.value = 'medium';
  } else if(selection == 2) {
    difficultySelection.style.backgroundImage = 'linear-gradient(to right, #ed2939, #ff0800)';
    difficultyInput.value = 'hard';
  }
};

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
const showAlert = (type, msg, time = 7) => {
  let newMsg;
  hideAlert();

  if(type == 'error' && typeof(msg) == "string")
    // newMsg = '<ul>'+msg.split('\n').map(el => `<li>${el}</li>`).join('')+'</ul>';
    newMsg = msg.split('\n')[0];

  const markup = `<div class="alert alert--${type}">${newMsg ? newMsg : msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(hideAlert, time * 1000);
};

const login = async (_user, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        _user,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login successful! Welcome back!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Incorrect email or password');
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Sign out successful!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Unable to sign out. Try again later.');
  }
};

const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Sign up successful! Welcome, '+data.name.split(' ')[0]+'!');
      setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const checkUsername = async () => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/username',
      data: {
        username: username.value
      }
    });
    if(res.data.usernameIsTaken == true){
      username.classList.add('input--invalid');
    } else
      username.classList.remove('input--invalid');
  } catch(err) {
    console.error('error attempting to check username availability');
  }
};

const deleteWord = async (word) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: '/api/v1/words',
      data: {
        word
      }
    });

    if (res.status == 204)
      location.assign('/');
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
};

const changeUserInfo = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/me',
      data
    });

    if(res.data.status === 'success') {
      showAlert('success', 'Your account information was successfully updated!');
      setTimeout(() => {
        location.assign('/me');
      }, 3000);
    }
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
};

const changePassword = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
      data
    });

    if(res.data.status === 'success') {
      showAlert('success', 'Password was successfully updated!');
      setTimeout(() => {
        location.assign('/me');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const debounce = (fn, delay) => {
  clearTimeout(timerId);
  timerId = setTimeout(fn, delay);
};

// DELEGATION

if(duplicateEntry) {
  list.scrollTop = duplicateEntry.offsetTop - list.offsetTop;
}

if(difficultyArrows.length > 0) {
  difficultyArrows[0].addEventListener('click', function() {
    changeColor('prev');
  });
  difficultyArrows[1].addEventListener('click', function() {
    changeColor('next');
  });
}

if(loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    login(user, password);
  });
}

if(logoutBtn) {
  logoutBtn.addEventListener('click', e => {
    logout();
  });
}

if(signupForm){
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    signup({
      name,
      username: username.value,
      email,
      password,
      passwordConfirm
    });
  });
}

if(userInfoForm) {
  userInfoForm.addEventListener('submit', e => {
    let data = {};

    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    if(name.length > 0)
      data.name = name;
    if(email.length > 0)
      data.email = email;
    if(username.value > 0)
      data.username = username.value;

    if(Object.values(data).length > 0)
      changeUserInfo(data);
  });
}

if(passwordChangeForm) {
  passwordChangeForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('confirm-new-password').value;
    changePassword({
      password,
      newPassword,
      newPasswordConfirm
    });
  });
}

if(username) {
  username.addEventListener('keyup', e => {
    debounce(checkUsername, 1200);
  });
}

if(yourList) {
  yourList.addEventListener('click', e => {
    document.querySelector('.list').scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest"
    });
  });
}































// EOF
