# umati
Umati (<em>oo•mah•tee</em>) is a social news website that places emphasis on small communities and the individuals within them. Communities in Umati are called Umatis. Content moderators are free to moderate their Umatis however they wish provided that all users follow Umati's Terms of Service.

# Goals
* Allow users to post both personal and public content, creating a platform that is both social and informative
* Allow users to comment and share their thoughts on user-generated content
* Allow for the existence of sovereign Umatis which abide by Umati's ToS and other rules imposed by their moderators
* Create a secure, safe, simplistic, self-governing social news application

# Concepts

### Social news

Social news websites feature user-generated stories. A social news website such as Reddit or Digg allows users to vote on posts. Trending posts - posts that are heavily upvoted within a short period of time - are displayed first to the user. News websites lean heavily on 'newsworthy content' whereas social news websites lean on content that is tailored to the average social news user.

What sets Umati apart from social news sites is the slight emphasis on individual posts. One of Umati's goals is to allow users to post both personal and public content, which removes the typical anonymity from a social news site.

### Security

Umati's top concern is security. Umati is protected with SSL (Secure Sockets Layer) encryption, which effectively establishes a secure channel between server and client. Like many other sites, Umati has a public key certificate issued by a Certificate Authority, which allows this essential encryption to take place. In addition, Umati accounts are secured with token authentication. Rather than sending passwords to the server for each request, Umati sends an encoded token which expires in a short amount of time.

### Safety

Umatis are moderated by a hard-working volunteer force - Moderators. By dividing Umati into smaller internet communities, the burden of Internet moderation is distributed and lessened, and the price of keeping users safe from harmful content is minimized. Site-wide ToS violations are reported to admins for further investigation.

### Simplicity

Umati has a simplistic user interface which allows both desktop and mobile users to contribute to Umati. Plans for a mobile app are to be announced.

### Self-governance

By passing the burden of Internet moderation onto the moderators, Umati allows for the creation of vibrant communities that have unique customs and traditions. Each Umati follows the site-wide ToS, which enforces some consistency and safety among the Umatis, yet the Umatis are free to impose additional restrictions and customs on each individual user. Users are also able to post content to their own profile and moderate comments attached to their posts.

# Current features

Features are currently divided into three areas. Core, Security, and Moderation.

### Core features

**User features**
* Create and access user account
* Customize username, display name, avatar, and description
* View posts created by each user


**Umati (group) features**
* Create and view Umatis
* Customize Umati name, display name, logo, and description
* View posts created under each Umati

**Posts features**
* Create posts under Umatis (WIP: be able to create posts under account)
* Add optional body and picture to post. All assets stored in database
* View all posts in Umati by opening Posts tab
* WIP: Comments

### Security features

* Token authentication
* Renewable access tokens, refresh tokens stored in datastore
* SSL encryption

### Moderation features

* WIP: Add moderators
* WIP: Extensive moderation settings
