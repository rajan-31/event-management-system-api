# Event Management System API

### Tech Stack

-   Node.js
-   Express.js
-   MongoDB (MongoDB Atlas)

### 1. Install requirements

In project root folder execute,

```bash
npm install
```

### 2. Set environment variables

-   Rename `.env.sample` file to `.env`
-   Set MongoDB connection URL (local or MongoDB Atlas)

### 3. Start Server

```bash
npm start
```

Server will be accessible at http://localhost:8080

<br><br>

## API testing using Postman

**Download Postman collection from [here](https://drive.google.com/file/d/1DdXJAtK2IWKRhloXtI87n276qGKfnCuK/view?usp=share_link) and import it in Postman**

<br>

For event's POST and PUT requests following data format is required in form-data body

```python
*title: <String>

*registrationLink: <String>

*dateTimeFrom: <DateTime>       # DD/MM/YYYY hh:mm:ss a

*dateTimeTo: <DateTime>         # DD/MM/YYYY hh:mm:ss a

*about: <String>                # HTML from rich text editor

*speakers[i][name]: <String>

*speakers[i][about]: <String>

*speakers[i]: <File>

moderators[j][name]: <String>

moderators[j][about]: <String>

moderators[j]: <File>

readingMaterialAndResources: <String>   # HTML from rich text editor

joiningInfo: <String>                   # HTML from rich text editor

organizedBy[m]: <String>

tags[n]: <String>
```

Note:

-   Values of i, j, m and n start from 0 and incremented by 1, to add more
-   \* indicates required field
-   At least 1 speaker is required
-   HTML from rich text editor is treated as normal string (after sanitization) on server side

<br>

### GET /event

Returns all events

<br>

### POST /event

-   Use body type `form-data`
-   Use event data format specified previously
-   To add Speaker's or Moderator's image select field type as file (for speakers[i], moderators[i])

### GET /event/:id

-   Use existing event id

### PUT /event/:id

-   Use body type `form-data`
-   Use event data format specified previously
-   To add Speaker's or Moderator's image select field type as file (for speakers[i], moderators[i])
-   if `title` is changed, then it needs to be unique

### DELETE /event/:id

-   Use existing event id

<br><br>

# Project Planning

I identified the data types and format needed for each event field. Then, I realised the HTML form encoding type suited here is `multipart/form-data`, because we had to submit binary data, such as files. I observed that there are field types which have special requirements, like

1. Rich text editor (Plain text, formatted text, images, embedded videos, etc.)
2. Image file
3. List (array) of values

I did not recognise the rich text editor used, so I assumed it works like any other. I have previously used SummerNote rich text editor, so I knew everything added in it gets converted to HTML, which is submitted later with the form. Images and other attachments are converted to base64-encoded data and used as data URLs. So, no need to handle these images and attachments separately, as they will be included in HTML. So, data (HTML) from the rich text editors will be submitted to the server as a string.

I had to handle fields where we needed an array/list of data, as these fields have names in form with an index, for speakers, moderators, organisers and tags. These types of fields are handled by Multer middleware; why I used Multer is explained below.

The last thing to think about was uploading images of speakers and moderators. Here I used Multer, node.js middleware for handling "multipart/form-data", primarily used for uploading files. There are other options available, like Formidable, Busboy, etc., but I chose Multer because It is simple, efficient, and I am familiar with it. Now I had to choose a way to store images from the following options:

1. Server file system (and later serve files as static content)
2. MongoDB (images in Binary format along with other data)

I decided not to use MongoDB to store files/images. Because storing files in MongoDB increases collection size faster, affecting the server's performance as data insertion and retrieval become slower. If, in future, our application is scaled horizontally (multiple instances of the app used), then instead of storing images in one server's file system, we can use a cloud service or a distributed file system and efficiently upload and serve the images.

In POST and PUT requests for an event, it is validated that data is in the correct format and is valid, and as a safety precaution, the rich text editor's data is sanitised using "Dompurify" package.

The API endpoints are tested with Postman for all the edge cases that I was able to find.
