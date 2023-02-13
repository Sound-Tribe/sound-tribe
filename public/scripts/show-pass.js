const pass = document.getElementById('password');
const showButton = document.getElementById('showpass');

showButton.addEventListener('click', function() {
    if(pass.type === 'password') {
        pass.type = 'text';
        showButton.innerHTML = 'Hide';
    } else {
        pass.type = 'password';
        showButton.innerHTML = 'Show';
    }
})