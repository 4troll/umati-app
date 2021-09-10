# umati

![notifications](https://user-images.githubusercontent.com/50559427/132928779-0d0e5e98-6df2-46c9-be7b-b7cc39b60082.png)
Umati (<em>oo•mah•tee</em>) is a social news website that places emphasis on small communities and the individuals within them. Communities in Umati are called Umatis. Content moderators are free to moderate their Umatis however they wish provided that all users follow Umati's Terms of Service.

# Goals
* Allow users to post both personal and public content, creating a platform that is both social and informative
* Allow users to comment and share their thoughts on user-generated content
* Allow for the existence of sovereign Umatis which abide by Umati's ToS and other rules imposed by their moderators
* Create a secure, safe, simplistic, self-governing social news application

# Concepts

<details>
<summary>
<b>
Social news
</b>
</summary>

Social news websites feature user-generated stories. A social news website such as Reddit or Digg allows users to vote on posts. Trending posts - posts that are heavily upvoted within a short period of time - are displayed first to the user. News websites lean heavily on 'newsworthy content' whereas social news websites lean on content that is tailored to the average social news user.

What sets Umati apart from social news sites is the slight emphasis on individual posts. One of Umati's goals is to allow users to post both personal and public content, which removes the typical anonymity from a social news site.
</details>

<details>
<summary>
<b>
Security
</b>
</summary>

Umati's top concern is security. Umati is protected with SSL (Secure Sockets Layer) encryption, which effectively establishes a secure channel between server and client. Like many other sites, Umati has a public key certificate issued by a Certificate Authority, which allows this essential encryption to take place. In addition, Umati accounts are secured with token authentication. Rather than sending passwords to the server for each request, Umati sends an encoded token which expires in a short amount of time.
</details>

<details>
<summary>
<b>
Safety
</b>
</summary>
Umatis are moderated by a hard-working volunteer force - Moderators. By dividing Umati into smaller internet communities, the burden of Internet moderation is distributed and lessened, and the price of keeping users safe from harmful content is minimized. Site-wide ToS violations are reported to admins for further investigation.
</details>

<details>
<summary>
<b>
Simplicity
</b>
</summary>
Umati has a simplistic user interface which allows both desktop and mobile users to contribute to Umati. Plans for a mobile app are to be announced.
</details>
  
<details>
<summary>
<b>
Self-governance
</b>
</summary>
By passing the burden of Internet moderation onto the moderators, Umati allows for the creation of vibrant communities that have unique customs and traditions. Each Umati follows the site-wide ToS, which enforces some consistency and safety among the Umatis, yet the Umatis are free to impose additional restrictions and customs on each individual user. Users are also able to post content to their own profile and moderate comments attached to their posts.
</details>

# Current features

Features are currently divided into three areas. **Core**, **Security**, and **Moderation**.

### Core features

<details>
<summary><b>Users</b></summary>


<ul>
<li>Create and access user account</li>
<li>Customize username, display name, avatar, and description</li>
<li>Custom Markdown parser for description - supports user and Umati mentions</li>
<li>View posts created by each user</li>
</ul>
</details>

![account view](https://user-images.githubusercontent.com/50559427/132928420-61f24a29-f0b2-4c04-9c2d-11d5140e2079.png)

![editnameandavatar](https://user-images.githubusercontent.com/50559427/132928471-0f3ac802-c1bc-4660-9a22-c771a9b48041.png)

<details>
<summary><b>Umatis (groups)</b></summary>


<ul>
<li>Create and view Umatis
<li>Customize Umati name, display name, logo, and description</li>
<li>Custom Markdown parser for description - supports user and Umati mentions</li>
<li>View posts created under each Umati (see Posts features)</li>
<li>Join relatable Umatis with the Join button, join count displayed on Umati profile</li>
<li>WIP: Community customization (banners, umati categories, user tags, etc)</li>
</ul>
</details>

![create umati](https://user-images.githubusercontent.com/50559427/132928494-dfc47389-bef8-4bc1-81e0-5c0971d230cb.png)

![edit description](https://user-images.githubusercontent.com/50559427/132928497-19f42b68-0d00-45f2-b179-7985108934c7.png)

![editumatiname](https://user-images.githubusercontent.com/50559427/132928500-fb5ff489-6d96-43f3-9281-b2ff1bfa7046.png)

![umati view](https://user-images.githubusercontent.com/50559427/132928518-bc2e8ef9-187d-4045-857a-e6a849ea918b.png)

![umatisview](https://user-images.githubusercontent.com/50559427/132928528-3990bfb0-f0c3-410d-9560-4845a2479a8e.png)

<details>
<summary><b>Posts</b></summary>


<ul>
<li>Create posts under Umatis (WIP: be able to create posts under account)</li>
<li>Add optional body and image to post. Image assets stored in database</li>
<li>View all posts in Umati by opening Posts tab</li>
<li>Users can _Like_ insightful posts or _Dislike_ rule-breaking or low-quality posts</li>
<li>Posts can be sorted in different orders: Trending (Reddit Hot algorithm), New, Top (Lower bound of Wilson score confidence interval for a Bernoulli parameter), Liked, Disliked, Controversial (closest to 50% like ratio), and Old.</li>
</ul>
</details>

![create post](https://user-images.githubusercontent.com/50559427/132928541-5b5300c2-201f-4d02-94a8-786173760012.png)

![sorting](https://user-images.githubusercontent.com/50559427/132928598-1cf97ced-e8f1-44b8-8535-1cb212606a27.png)

<details>
<summary><b>Comments</b></summary>


<ul>
<li>Comments are a way to contribute to the discussion generated by a post</li>
<li>Like comments that are insightful or dislike comments that are low-effort or break sitewide/umati rules</li>
<li>Custom Markdown parser for comments - supports user and Umati mentions (WIP: user pings)</li>
<li>Reply to comments to add on to the conversation, or indicate dissent</li>
<li>Nested comments: Unlike Youtube or Instagram, comment replies are stored as a tree model which allows for fluid discussion</li>
<li>Comment permalinks allow viewers to jump to related discussion - linked comments have a yellow tint</li>
</ul>
</details>

![comment](https://user-images.githubusercontent.com/50559427/132928558-c44384f8-015c-4d99-bc6e-d9eacbe47c13.png)

<details>
<summary><b>Notifications</b></summary>


<ul>
<li>Click the bell icon to see your server-stored notifications</li>
<li>Join umatis to get notified when new posts are made (on your next visit)</li>
<li>Get notified when your post reaches new milestones (1, 5, 10, 25, 50, 75, with a similar pattern across other orders of magnitude)</li>
<li>Click notifications to jump to content which sets the notification on "seen". New notifications have a blue tint</li>
<li>Bell icon badge indicates amount of new notifications</li>
</ul>
</details>

![notifications](https://user-images.githubusercontent.com/50559427/132928571-53058a22-cb32-42a2-8151-1872dede9887.png)

![milestones](https://user-images.githubusercontent.com/50559427/132928573-98f883b7-6348-4331-be53-94d048909b40.png)

### Security features
<ul>
<li>Token authentication (stateless, prevents storing of permanent password in client storage)
<li>Automatic renewal of access tokens, refresh tokens stored in datastore
<li>SSL encryption
<li>Ratelimits: Account and Umati creation (5 per hour), Login and Token Renewal (30 per 5 mins), Account and Umati Edits (30 per 15m), Posts (10 per 5m)
</ul>

### Moderation features

<details>
<summary><b>Rules</b></summary>


<ul>
<li>Create and remove rules</li>
<li>Edit rules with simplistic modal</li>
<li>Reorder rules with gratifying drag-and-drop mechanic</li>
<li>Rules can apply to all UGC (user generated content), only posts, or only comments</li>
</ul>
</details>

![add rule](https://user-images.githubusercontent.com/50559427/132928588-ea573102-cad6-4ae0-98a8-0f4836808f5b.png)

![rule view](https://user-images.githubusercontent.com/50559427/132928591-9d7ec8f5-6a77-438c-875f-51be41e2f2c1.png)

<details>

<summary><b>Other</b></summary>
<ul>
<li>WIP: Report menu (list rules as radio buttons)</li>
<li>WIP: Add moderators</li>
<li>WIP: Extensive moderation settings</li>
</ul>
</details>

# Technologies

* Node.js backend
* Express backend
* React frontend
* material-ui React library
* MongoDB backend datastore with Atlas host
* Heroku host
* Countless libraries not mentioned (see package.json)
