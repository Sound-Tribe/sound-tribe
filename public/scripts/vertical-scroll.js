function assignVerticalValue () {
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        let inputId = post.id.replace("post", "");
        let input = document.getElementById(inputId);
        let scrollPosition = window.scrollY;
        input.value = scrollPosition;
    });
}