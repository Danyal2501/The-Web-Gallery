window.onload = (async function () {
  "use strict";
  let commentIndex = 0;
  let curName;
  let curId;
  const currImage = document.querySelector(".image");
  const formContainer = document.querySelector("#popup-form-container");
  const loginContainer = document.querySelector("#login-form-container");
  const signupContainer = document.querySelector("#signup-form-container");
  const commentSection = document.querySelector("#comments-section");

  document.querySelector("#next-image").addEventListener("click", function (e) {
    loadImage(parseInt(currImage.id), 1);
  });
  document.querySelector("#prev-image").addEventListener("click", function (e) {
    loadImage(parseInt(currImage.id), -1);
  });
  document
    .querySelector("#next-gallery")
    .addEventListener("click", function (e) {
      loadGallery(parseInt(curId), 1);
    });
  document
    .querySelector("#prev-gallery")
    .addEventListener("click", function (e) {
      loadGallery(parseInt(curId), -1);
    });
  document
    .querySelector("#next-comments")
    .addEventListener("click", function (e) {
      loadComments(parseInt(currImage.id), commentIndex + 10);
    });
  document
    .querySelector("#prev-comments")
    .addEventListener("click", function (e) {
      loadComments(parseInt(currImage.id), commentIndex - 10);
    });
  document.querySelector("#open-form").addEventListener("click", function () {
    formContainer.classList.toggle("show");
  });
  document.querySelector("#open-login").addEventListener("click", function () {
    signOut();
  });
  document.querySelector("#open-signup").addEventListener("click", function () {
    signupContainer.classList.toggle("show");
  });
  document
    .getElementById("delete-image")
    .addEventListener("click", function () {
      const imageDelete = parseInt(currImage.id);
      return apiService.deleteImage(imageDelete).then(function () {
        loadImage(parseInt(currImage.id), -1);
      });
    });

  formContainer.addEventListener("click", function (e) {
    formContainer.classList.remove("show");
  });
  formContainer.querySelector("form").addEventListener("click", function (e) {
    e.stopPropagation();
  });

  signupContainer.addEventListener("click", function (e) {
    signupContainer.classList.remove("show");
  });
  signupContainer.querySelector("form").addEventListener("click", function (e) {
    e.stopPropagation();
  });
  document
    .querySelector("#comments-button")
    .addEventListener("click", function (e) {
      if (getComputedStyle(commentSection).display === "none") {
        commentSection.classList.remove("hidden");
        /* This is necessary if we want the CSS animation to show */
        setTimeout(function () {
          commentSection.classList.toggle("show");
          window.scrollTo(0, document.body.scrollHeight);
        }, 1);
      } else {
        window.scrollTo(0, 0);
        commentSection.classList.toggle("show");
        setTimeout(function () {
          commentSection.classList.add("hidden");
        }, 300);
      }
    });

  document
    .getElementById("signup-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const err = document.getElementById("signup-error");
      const name = document.getElementById("signup-name").value;
      const pass = document.getElementById("signup-password").value;
      const confirm = document.getElementById("signup-confirm-password").value;
      if (pass != confirm) {
        err.innerHTML = "Passwords do not match";
        err.classList.remove("hidden");
        return;
      }

      return apiService
        .addUser(name, pass)
        .then(function () {
          err.classList.add("hidden");
          e.target.reset();
          signupContainer.classList.remove("show");
        })
        .catch(function (error) {
          err.innerHTML = "Username already exists";
          err.classList.remove("hidden");
        });
    });

  document
    .getElementById("login-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const err = document.getElementById("login-error");
      const name = document.getElementById("login-name").value;
      const pass = document.getElementById("login-password").value;

      apiService
        .loginUser(name, pass)
        .then(function () {
          err.classList.add("hidden");
          e.target.reset();
          formContainer.classList.remove("show");
          checkLogin();
        })
        .catch(function (error) {
          err.innerHTML = "Incorrect username/password";
          err.classList.remove("hidden");
        });
    });

  document
    .getElementById("add-image-form")
    .addEventListener("submit", function (e) {
      // prevent from refreshing the page on submit
      e.preventDefault();
      const err = document.getElementById("error");
      const title = document.getElementById("title").value;
      const img = document.getElementById("picture").files[0];

      if (img.type.split("/")[0] != "image") {
        err.classList.remove("hidden");
        return;
      }
      err.classList.add("hidden");

      return apiService.addImage(title, img).then(function (res) {
        if (res.error) return;
        loadImage();
        e.target.reset();
        formContainer.classList.remove("show");
      });
    });

  document
    .getElementById("comment-form")
    .addEventListener("submit", function (e) {
      // prevent from refreshing the page on submit
      e.preventDefault();
      const content = document.getElementById("new-comment-text").value;
      return apiService
        .addComment(parseInt(currImage.id), content)
        .then(function () {
          e.target.reset();
          loadImage(parseInt(currImage.id));
          setTimeout(function () {
            window.scrollTo(0, document.body.scrollHeight);
          }, 200);
        });

      // read form elements
    });

  const loadImage = function (index = -1, increment = 0) {
    commentIndex = 0;
    return apiService.getImage(index, increment, curId).then(function (curr) {
      const hideDivs = document.querySelectorAll(
        "#image-details, #image-interactions, #prev-image, #next-image"
      );

      if (!curr) {
        document.querySelector("#current-image").src = "";
        hideDivs.forEach((elem) => elem.classList.add("hidden"));
        document.querySelector(".image").id = -1;
        window.scrollTo(0, 0);
        commentSection.classList.remove("show");
        setTimeout(function () {
          commentSection.classList.add("hidden");
        }, 300);
        return;
      }
      hideDivs.forEach((elem) => elem.classList.remove("hidden"));
      document.querySelector("#current-image").src =
        "api/images/src/" + curr.id;
      document.querySelector("#image-title").innerHTML = curr.title;
      document.querySelector(".image").id = curr.id;
      loadComments(curr.id, commentIndex);
    });
  };

  const loadGallery = function (index = -1, increment = 0) {
    return apiService.getGallery(index, increment).then(function (curr) {
      if (curr.error) return;
      let user = curr.username;
      document.querySelector("#delete-image").classList.add("hidden");
      if (user === curName) {
        user = "Me";
        document.querySelector("#delete-image").classList.remove("hidden");
      }
      curId = curr.id;
      document.querySelector(".gallery-pagination").id = curId;
      document.querySelector("#username").innerHTML = user;
      loadImage();
    });
  };

  const checkLogin = function () {
    return apiService.getUser().then(function (tes) {
      const wrapper = document.getElementById("featured");
      if (tes.username) {
        loginContainer.classList.remove("show");
        wrapper.classList.remove("hidden");
        curName = tes.username;
        curId = tes.id;
        document.querySelector(".gallery-pagination").id = curId;
        loadGallery(curId);
        return curName;
      }
      wrapper.classList.add("hidden");
      loginContainer.classList.add("show");
      loginContainer.removeAttribute("onclick");
      curName = null;
      curId = -1;
      return curName;
    });
  };

  const signOut = function () {
    return apiService.logoutUser().then(function () {
      checkLogin();
    });
  };

  const loadComments = function (id, index) {
    return apiService.getComments(id).then(function (comments) {
      const nextComments = document.getElementById("next-comments");
      const prevComments = document.getElementById("prev-comments");
      const noComments = document.getElementById("no-comments");

      if (comments.error) return;

      noComments.classList.add("hidden");
      nextComments.disabled = false;
      prevComments.disabled = false;
      nextComments.classList.remove("hidden");
      prevComments.classList.remove("hidden");
      if (index + 10 >= comments.length) {
        nextComments.disabled = true;
        nextComments.classList.add("hidden");
      }
      if (index === 0) {
        prevComments.disabled = true;
        prevComments.classList.add("hidden");
      }
      commentIndex = index;

      const curr = comments.reverse().slice(commentIndex, commentIndex + 10);
      if (curr.length === 0) {
        noComments.classList.remove("hidden");
      }
      document.getElementById("comments").innerHTML = "";
      curr.forEach((comment) => {
        const myComment = comment.author === curName;
        const myImage = document.querySelector("#username").innerHTML == "Me";
        if (myComment) {
          comment.author = "Me";
        }
        let elmt = document.createElement("div");
        elmt.className = "comment";
        elmt.id = comment.commentId;
        elmt.innerHTML = `
                <div class="comment-wrapper">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-date">${comment.createdAt.substr(
                          0,
                          10
                        )}</span>
                    </div>
                    <p class="comment-text">${comment.content}</p>
                </div>`;
        if (myComment || myImage) {
          elmt.classList.add("comment-hover");
          elmt.innerHTML += `<div class="delete" style="">
                    <i class="fa fa-trash"></i>Delete
                </div>`;
          elmt.querySelector(".delete").addEventListener("click", function (e) {
            return apiService
              .deleteComment(comment.commentId)
              .then(function () {
                loadComments(id, index);
              });
          });
        }
        document.getElementById("comments").append(elmt);
      });
    });
  };
  checkLogin();
})();
