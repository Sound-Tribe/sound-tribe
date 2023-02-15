const pass = document.getElementById('password');
const showButton = document.getElementById('showpass');

showButton.addEventListener('click', function() {
    if(pass.type === 'password') {
        pass.type = 'text';
        this.src = '/images/hide.png';
    } else {
        pass.type = 'password';
        this.src = '/images/show.png'
    }
})