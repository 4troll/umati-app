import React, { useEffect,useLayoutEffect, useRef, useState, Component, Fragment } from "react";


import {useParams, useHistory, useLocation, Link} from "react-router-dom";

import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Divider,
    Typography,
	makeStyles,
	Container,
	Grid,
	TextField,
	CardHeader,
	IconButton,
	Menu,
	MenuItem,
	Modal,
	Fab
} from '@material-ui/core';

export default function Policies() {

return (
    <Box
			sx={{
				backgroundColor: 'background.default',
				minHeight: '100%',
                minWidth: '100%',
				py: 3
			}}
            style={{minWidth:"350px"}}
			>
				<Container maxWidth={1/4}>
                <strong>Skip to:</strong><br/>
                <a href="/policies#umati_user_agreement">Umati User Agreement</a> <br/>
                <a href="/policies#content_policy">Content Policy</a>
                <a id="umati_user_agreement">
                <h2>Umati User Agreement</h2>
                </a>
<p>Welcome to Umati! Umati is a social news website that places emphasis on small communities and the individuals within them. The communities within Umati are governed with both Umati's sitewide policies as well as the policies of individual Umatis (Umati's communities).</p>
<p>The Umati User Agreement ("<strong>Terms</strong>") applies to your applies to your access to and use of the online products and services (&ldquo;<strong>Services</strong>&rdquo;) provided by Umati. (&ldquo;<strong>Umati</strong>,&rdquo; &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;).</p>
<p>Umati is built to be both an entertaining and informative site for community-curated stories. By utilizing (viewing, creating, modifying) our services, you are giving your consent to be bound by these Terms. If you do not agree with these Terms, or any policies laid out on this page, you may not utilize our Services in any way.</p>
<h3>Use of the Services</h3>
<p>We reserve the right to modify, suspend, or discontinue the Services (in whole or in part) at any time, with or without notice to you. Any future release, update, or other addition to functionality of the Services will be subject to these Terms, which may be updated from time to time. You agree that we will not be liable to you or to any third party for any modification, suspension, or discontinuation of the Services or any part thereof.</p>
<h3><strong class="h3">Your Content</strong></h3>
<p>The Services may contain information, text, links, graphics, photos, videos, or other materials (&ldquo;<strong>Content</strong>&rdquo;), including Content created or submitted to the Services by you or through your Account (&ldquo;<strong>Your Content</strong>&rdquo;). We take no responsibility for and we do not expressly or implicitly endorse, support, or guarantee the completeness, truthfulness, accuracy, or reliability of any of Your Content.</p>
<p>By submitting Your Content to the Services, you represent and warrant that you have all rights, power, and authority necessary to grant the rights to Your Content contained within these Terms. Because you alone are responsible for Your Content, you may expose yourself to liability if you post or share Content without all necessary rights.</p>
<p>You retain any ownership rights you have in Your Content, but you grant Umati the following license to use that Content:</p>
<p>When Your Content is created with or submitted to the Services, you grant us a worldwide, royalty-free, perpetual, irrevocable, non-exclusive, transferable, and sublicensable license to use, copy, modify, adapt, prepare derivative works of, distribute, store, perform, and display Your Content and any name, username, voice, or likeness provided in connection with Your Content in all media formats and channels now known or later developed anywhere in the world. This license includes the right for us to make Your Content available for syndication, broadcast, distribution, or publication by other companies, organizations, or individuals who partner with Umati. You also agree that we may remove metadata associated with Your Content, and you irrevocably waive any claims and assertions of moral rights or attribution with respect to Your Content.</p>
<p>Any ideas, suggestions, and feedback about Umati or our Services that you provide to us are entirely voluntary, and you agree that Umati may use such ideas, suggestions, and feedback without compensation or obligation to you.</p>
<p>Although we have no obligation to screen, edit, or monitor Your Content, we may, in our sole discretion, delete or remove Your Content at any time and for any reason, including for violating these Terms, violating our Content Policy, or if you otherwise create or are likely to create liability for us. We reserve the right to remove any Content on our platform without any disclosed reason.</p>
<h3><strong class="h3">Third-Party Content, Advertisements, and Promotions</strong></h3>
<div class="text no-counter">
<p>The Services may contain links to third-party websites, products, or services, which may be posted by advertisers, our affiliates, our partners, or other users (&ldquo;<strong>Third-Party Content</strong>&rdquo;). Third-Party Content is not under our control, and we are not responsible for any third party&rsquo;s websites, products, or services. Your use of Third-Party Content is at your own risk and you should make any investigation you feel necessary before proceeding with any transaction in connection with such Third-Party Content.</p>
<p>The Services may also contain sponsored Third-Party Content or advertisements. The type, degree, and targeting of advertisements are subject to change, and you acknowledge and agree that we may place advertisements in connection with the display of any Content or information on the Services, including Your Content.</p>
<p>If you choose to use the Services to conduct a promotion, including a contest or sweepstakes (&ldquo;<strong>Promotion</strong>&rdquo;), you alone are responsible for conducting the Promotion in compliance with all applicable laws and regulations at your own risk. Your Promotion must state that the Promotion is not sponsored by, endorsed by, or associated with Umati, and the rules for your Promotion must require each entrant or participant to release Umati&nbsp;from any liability related to the Promotion.</p>
</div>
<h3><strong class="h3">Things You Cannot Do</strong></h3>
<div class="text no-counter">
<p>When using or accessing Umati, you must comply with these Terms and all applicable laws, rules, and regulations. Please review the Content Policy, which are part of these Terms and contains Umati&rsquo;s rules about prohibited content and conduct. In addition to what is prohibited in the Content Policy, you may not do any of the following:</p>
<ul>
<li>Use the Services in any manner that could interfere with, disable, disrupt, overburden, or otherwise impair the Services.</li>
<li>Gain access to (or attempt to gain access to) another user&rsquo;s Account or any non-public portions of the Services, including the computer systems or networks connected to or used together with the Services.</li>
<li>Upload, transmit, or distribute to or through the Services any viruses, worms, malicious code, or other software intended to interfere with the Services, including its security-related features.</li>
<li>Use the Services to violate applicable law or infringe any person&rsquo;s or entity's intellectual property rights or any other proprietary rights.</li>
<li>Access, search, or collect data from the Services by any means (automated or otherwise) except as permitted in these Terms or in a separate agreement with Umati. We conditionally grant permission to crawl the Services in accordance with the parameters set forth in our robots.txt file, but scraping the Services without Umati&rsquo;s prior consent is prohibited.</li>
<li>Use the Services in any manner that we reasonably believe to be an abuse of or fraud on Umati or any payment system.</li>
<li>Perform actions which are non-compliant with United States, Canadian, or English law.</li>
</ul>
<p>We encourage you to report content or conduct that you believe violates these Terms or our Content Policy.</p>
<h3><strong class="h3">Moderators</strong></h3>
<p>Moderating or Owning an Umati is an unofficial, unpaid, voluntary position that may be available to users of the Services. We are not responsible for actions taken by the moderators. We reserve the right to revoke or limit a user&rsquo;s ability to moderate at any time and for any reason or no reason, including for a breach of these Terms. Umati reserves the right, but has no obligation, to overturn any action or decision of a moderator if Umati, in its sole discretion, believes that such action or decision is not in the interest of Umati or the Umati community.</p>
<p>&nbsp;</p>


<div class="text no-counter">
<a id="content_policy">
<h2>Content Policy</h2>
</a>
<div class="text-holder">
<div class="text no-counter">
<p>Umati is a vast network of communities (known on the Platform as Umatis) that are created, run, and populated by you, the Umati users.</p>
<p>Through these communities, you can converse, create, and connect with people who share your interests, and we encourage you to find&mdash;or even create&mdash;your home on Umati.</p>
<p>Every community on Umati is defined by its users. Some of these users help manage the community as moderators. The culture of each community is shaped explicitly, by the community rules enforced by moderators, and implicitly, by the users and their Content.</p>
<p>Below the rules governing each community are the platform-wide rules that apply to everyone on Umati. These rules are enforced by us, the admins.</p>
<p>Umati and its communities are only what we make of them together, and can only exist if we operate by a shared set of rules. We ask that you abide by not just the letter of these rules, but the spirit as well.</p>
</div>
</div>
<h3 class="text-holder section-active"><strong class="h4">Hate and harassment</strong></h3>
<div class="text-holder section-active">Umati is a place for creating community and belonging, not for attacking Protected Classes/Prohibited Grounds (race, national or ethnic origin, colour, religion, age, sex, sexual orientation, gender identity or expression, marital status, family status, genetic characteristics, disability, and conviction for an offence for which a pardon has been granted). Everyone has a right to use Umati free of harassment, bullying, and threats of violence. Communities and users that incite violence or that promote hate based on protected classes of people will be removed.</div>
<h3>Be authentic</h3>
</div>
<div class="text no-counter">
<div class="text no-counter">Abide by community rules. Post authentic content into communities where you have a personal interest, and do not cheat or engage in content manipulation (including spamming, vote manipulation, ban evasion, or subscriber fraud) or otherwise interfere with or disrupt Umati communities.</div>
<h3>Privacy</h3>
<div class="text-holder section-active">
<div class="text no-counter">
<p>Respect the privacy of others. Instigating harassment, for example by revealing someone&rsquo;s personal or confidential information, is not allowed.</p>
</div>
<h3>Impersonation</h3>
<div class="text no-counter">
<p>You don&rsquo;t have to use your real name to use Umati, but don&rsquo;t impersonate an individual or an entity in a misleading or deceptive manner. Parody accounts are allowed as long as they state they are parody accounts.</p>
</div>
<h3>No graphic or violent content</h3>
<div class="text no-counter">
<p>No graphic or violent content</p>
</div>
<h3>No illegal behavior</h3>
<div class="text no-counter">
<p>Keep it legal, and avoid posting illegal content or soliciting or facilitating illegal or prohibited transactions</p>
</div>
<h3>Breaking the site</h3>
<div class="text no-counter">
<p>Don&rsquo;t intentionally break the site or do anything that interferes with normal use of Umati.</p>
</div>
</div>
<div id="text-content2" class="text-holder">
<h3>Enforcement</h3>
<div class="text no-counter">
<p>We have a variety of ways of enforcing our rules, including, but not limited to</p>
<ul>
<li>Kind reminder</li>
<li>Reprimand</li>
<li>Temporary or permanent suspension of accounts</li>
<li>Removal of privileges from, or adding restrictions to, accounts</li>
<li>Adding restrictions to Umati communities</li>
<li>Removal of content</li>
<li>Removal of Umati communities</li>
</ul>
</div>
</div>
</div>
</div>
                </Container>
    </Box>
);
}