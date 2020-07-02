# Project

This project aims to produce a prototype micro-farming management system. This system will include management panels for landowners, tenants, suppliers and buyers. 

The finished product will take advantage of cloud-based hosting and databases. It will also have an API to allow the client to be flexible with their front-end and keep the possibility of extending the product to other platforms in the future.  

For this project, we aim to deliver the requirements in the form of: 

> A web application with sleek, user-friendly design.  
>
> Cloud-Based hosting platform and database. 
>
> Sample documentation for landowners and tenants.  

## Commits
Any commits for the administrative documents can go straight into develop, frontend and backend code should go into the develop branch, and code testing should be carried out in develop before being merged with testing for a code review and live testing. Master should only be committed to via testing when happy

Specific backend work, such as work on the API, should be done in the appropriate sub-branch, while generic (node) work can be done on the backend branch.

Per-person code testing can be put on their own branches if appropriate.

***Please remember to avoid committing node_modules***

## Pulling

Those using github desktop for admin documents (assuming they cant use the OneDrive structure instead) should push and pull whenever they can to the develop branch, organising what documents they want to edit to avoid merge conflicts.

Branch push and pulling for developers should be done frequently to ensure minimal unexpected work loss. 

Once a feature has been coded (see Gantt chart / associated progress review), it should be pushed to the develop branch. Post testing success, merge request to the testing branch should be carried out for code review and live testing, with needed changes going into the develop branch. Once happy, merging to the master branch should be carried out.

## Installation & Usage

For fresh installation of admin docs and stable code, use (with appropriate credentials)

```bash
git clone https://github.com/40417661-Napier/uniGroup.git
```

If running the stable build, use the appropriate package manager (npm) to download requirements for code from package.json 

```bash
cd ./microFarmsApp/
sudo npm i
nodemon ./index.js
```

## API Connections

Providing the API build is running on the local machine, connect via 

```http
localhost:5001/api/<RequestName>?<RequiredData>
```

With <RequestName> being the required requests, found in the ***[API Docs](/docs/API_Doc.md)***

## Contributing

Please make sure to update tests as appropriate.

## License
lol who needs a license for uni work
