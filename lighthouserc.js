module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/login",
        "http://localhost:3000/add",
        "http://localhost:3000/edit",
        "http://localhost:3000/view",
        "http://localhost:3000/find",
        "http://localhost:3000/manage/users",
        "http://localhost:3000/manage/reports",
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};