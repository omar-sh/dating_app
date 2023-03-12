# Dating application using serverless and mongoDB

This project has been generated using the `aws-nodejs-typescript` template from the [Serverless framework](https://www.serverless.com/).

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## How to start the project

First of all you need to have mongoDB to be able to start the project, then you can do the following:


```
 npm install
```

```
npm run dev
```

**To deploy to AWS you could run:**
```
sls deploy
```
(Don't forget to change env variables inside `serverless.yml` for DB when you deploy to production)

**Run tests**
```
npm run test
```


## DB design:

**users collection:** 

| Field        | type           | comments  |
| ------------- |:-------------:| -----:|
| name      | string | - |
| email      | string      | -   | 
| attractiveness | number      |    increase by 1 or decrease by 1 based on the swipes |
| password               |  string | - |
| gender                | FEMALE or MALE | -
| location              | geoLocation | contains location data for each user


**preferences collection:**

| Field        | type           | comments  |
| ------------- |:-------------:| -----:|
| user      | ObjectId | the user who liked the profile |
| profile      | ObjectId      | the user who got the like   | 
| preference | YES or NO      |    - |

**WHY I NORMALIZED DATA AND CREATED PREFERENCE COLLECTION ?**

I thought about appending the ids directly inside the users documents like that:

```json
{
  "likes": [
    'userId1',
    'userId2'
  ],
  "dislikes": ['userId3']
}
```

but if we are going to extend our application, it will be harder and slower to get specific patterns.

(For example, get all the users who liked me)

## Profile endpoint:

Profiles are returned paginated (assuming that we are going to have a lot of users in the future)

Starting with profiles that are being returned to the user, it will always sort profiles by
attractiveness and location. 

You can also filter for additional data using the following properties in query parameters:


| Parameter        | type           | comments  |
| ------------- |:-------------:| -----:|
| page      | number | default is 1, you can use it when you have a lot of data and want to jump between pages |
| limit      | number      | default is 10   | 
| gender | MALE OR FEMALE      |    filter based on gender |
| minAge | number      |    get profiles starting from minimum age |
| maxAge | number      |    get profiles with a maximum age |
| maxDistance | number      |    search in your area and limit the distance radius you are looking in |









