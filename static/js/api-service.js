const apiService = (function () {
  "use strict";

  const module = {};

  module.addUser = function (username, pass) {
    return new Promise((resolve, reject) => {
      fetch("/api/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: pass }),
      })
        .then((res) => {
          if (res.status === 400) {
            reject(res.error);
          } else {
            return res.json();
          }
        })
        .then((data) => {
          resolve(data);
        });
    });
  };

  module.loginUser = function (username, password) {
    return new Promise((resolve, reject) => {
      fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      })
        .then((res) => {
          if (res.status === 400) {
            reject(res.error);
          } else {
            return res.json();
          }
        })
        .then((data) => {
          resolve(data);
        });
    });
  };

  module.logoutUser = function () {
    return fetch(`/api/users/logout`).then((res) => res.json());
  };
  module.getUser = function () {
    return fetch(`/api/users/me`).then((res) => res.json());
  };

  module.addImage = function (title, file) {
    const data = new FormData();
    data.append("file", file);
    data.append("title", title);
    return fetch("/api/images", {
      method: "POST",
      body: data,
    }).then((res) => res.json());
  };

  module.deleteImage = function (imageId) {
    return fetch(`/api/images/${imageId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  module.addComment = function (id, content) {
    return fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, content: content }),
    }).then((res) => res.json());
  };

  module.deleteComment = function (commentId) {
    return fetch(`/api/comments/${commentId}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  module.getImage = function (image, incr, user) {
    return fetch(`/api/images?user=${user}&image=${image}&incr=${incr}`).then(
      (res) => {
        if (res) {
          return res.json();
        }
        return null;
      }
    );
  };

  module.getGallery = function (index, incr) {
    return fetch(`/api/images/gallery?user=${index}&incr=${incr}`).then(
      (res) => {
        if (res) {
          return res.json();
        }
        return null;
      }
    );
  };

  module.getComments = function (id) {
    return fetch(`/api/comments?id=${id}`).then((res) => res.json());
  };

  return module;
})();
