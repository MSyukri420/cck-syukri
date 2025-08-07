# HR Performance Measure System (HRPMS)

## Introduction

This project is created for CCK Group by Group 6 of FYP Software Engineering. It is a web application that allows the user to create a performance measure for the employees. The user can also create a performance review for the employees. The user can also view the performance measure and performance review of the employees.

## Technologies Used
1. Node.js
2. Express.js
3. MongoDB
4. Handlebars Templating Engine

### Folder Structure
```
.
├── app/
│   ├── functions.js
│   ├── models/
│   ├── modules/
│   └── routes.js
├── .env
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
├── README.md
└── resources/
    ├── public/
    │   ├── css/
    │   ├── img/
    │   └── js/
    └── views/
        ├── layouts/
        └── partials/

```

You will have to follow the folder structure above. You may add more folders and files, but you should not remove any of the existing folders and files.

## Getting Started

1. Run `npm install` to install all the dependencies.
2. Run `node index.js` to start the server.

## Issues
If you encounter any issues, please create an issue in the GitHub repository.

## Contributions
1. You can see your contributions in the GitHub repository by temporarily setting to public and view in the Insights tab. You shouldn't do this, please ask the owner to do it.
2. Use your Trello to track your progress and update your progress in the Trello board.

## Things to Note
1. Before starting a new feature, create a new branch with the name of the feature. You can do this by running `git checkout -b <branch-name>`.
2. Use your GitHub Desktop to commit and push your changes to the branch.
3. Create a pull request to merge your branch to the master branch.
4. After merging, you may delete the branch and checkout to the master branch and pull the changes.
5. Please DO NOT commit directly to the master branch.

## Guide

1. Create your controllers in the `app/modules` folder.
2. Create your mongoose models in the `app/models` folder.
3. Link your controllers with the routes in `app/routes.js`.
4. Create your views in the `resources/views` folder.
5. Create your partials in the `resources/views/partials` folder.
6. Create your layouts in the `resources/views/layouts` folder.
7. Create your css files in the `resources/public/css` folder.
8. Create your js files in the `resources/public/js` folder.
9. Add your images in the `resources/public/img` folder.
10. Add your functions in the `app/functions.js` file.
11. You may create the `resources/uploads` folder. This is optional as the uploads folder will be created on application start.
12. Add your environment variables (such as your database connections) in the `.env` file. You should create this file yourself.