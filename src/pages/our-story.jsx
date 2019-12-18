import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/layout';
import SEO from '../components/seo';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const OurStory = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      press: allFile(
        filter: { relativeDirectory: { regex: "/(our-story/press)/" } }
        sort: { order: ASC, fields: name }
      ) {
        nodes {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
          name
        }
      }
      storyOfOurJourney: allFile(
        filter: {
          relativeDirectory: { regex: "/(our-story/story-of-our-journey)/" }
        }
        sort: { order: ASC, fields: name }
      ) {
        nodes {
          childImageSharp {
            fluid(maxWidth: 700) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
          name
        }
      }
    }
  `);
  return (
    <Layout location={location} name="our-story">
      <SEO title="Our Story" keywords={['Round&Round', 'Rotterdam']} />

      <h3 className="sub-heading mb-3" id="press">
        Press
      </h3>
      <Row>
        <Col xs={6}>
          <Img fluid={data.press.nodes[0].childImageSharp.fluid} />
          <p className="text-center mt-2">Newspapers</p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[1].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="https://www.facebook.com/rdambinnenstad/posts/1352774104785170"
              target="_blank"
              rel="noopener noreferrer"
              alt="Binnenstad Rotterdam"
            >
              Binnenstad Rotterdam #Rottergem
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[2].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="https://rotterdam.info/onze-blogs/blog-roundandround/"
              target="_blank"
              rel="noopener noreferrer"
              alt="Rotterdam Tourist Information"
            >
              Rotterdam Tourist Information
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[3].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="https://www.debuik.nl/rotterdam/restaurant/round-round"
              target="_blank"
              rel="noopener noreferrer"
              alt="De Buik van Rotterdam"
            >
              De Buik van Rotterdam
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[4].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://www.elleeten.nl/hotspots/ontbijt-rotterdam"
              target="_blank"
              rel="noopener noreferrer"
              alt="ELLE ETEN"
            >
              ELLE ETEN
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[5].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://www.openrotterdam.nl/open-vlogger-dani-mastert-matcha/nieuws/item?962352"
              target="_blank"
              rel="noopener noreferrer"
              alt="Open Rotterdam"
            >
              Open Rotterdam #matchaceremony
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[6].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://rotterdam.htspt.nl/en/roundround/"
              target="_blank"
              rel="noopener noreferrer"
              alt="HTSPT Rotterdam"
            >
              HTSPT Rotterdam
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[7].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="https://www.hutspot.com/things-to-do-in-june/"
              target="_blank"
              rel="noopener noreferrer"
              alt="Hutspot Tips"
            >
              Hutspot Tips
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[8].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="https://liyenfoodmoments.wordpress.com/2017/08/09/matcha-hotspots-rotterdam/"
              target="_blank"
              rel="noopener noreferrer"
              alt="Liyen's food moments"
            >
              Liyen&apos;s food moments
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[9].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://www.hoogkwartier.nl/verhalen/bing-chao-van-roundround/"
              target="_blank"
              rel="noopener noreferrer"
              alt="Hoogkwartier"
            >
              Hoogkwartier
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[10].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://rotterdam.htspt.nl/en/roundround/"
              target="_blank"
              rel="noopener noreferrer"
              alt="Spotte by Locals"
            >
              Spotte by Locals
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[11].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://www.elize010.nl/hotspot-rotterdam-round-round/"
              target="_blank"
              rel="noopener noreferrer"
              alt="Hotspot Rotterdam"
            >
              Hotspot Rotterdam
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[12].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="https://www.citizenm.com/citizenmag/rotterdam/places/round-round"
              target="_blank"
              rel="noopener noreferrer"
              alt="CitizenMag"
            >
              CitizenMag
            </a>
          </p>
        </Col>
        <Col xs={6}>
          <Img fluid={data.press.nodes[13].childImageSharp.fluid} />
          <p className="text-center mt-2">
            <a
              href="http://rotterdamiloveyou.com/design/round-round-design-cafe-round-fluffy-cakes/"
              target="_blank"
              rel="noopener noreferrer"
              alt="RotterdamILoveYou"
            >
              RotterdamILoveYou
            </a>
          </p>
        </Col>
      </Row>

      <h3 className="sub-heading" id="story-of-our-journey">
        Story of our Journey
      </h3>
      <h5>Our Story</h5>
      <p>The start of our little journey...</p>
      <p>
        We are Bing &amp; Chao, the co-founders of Round&amp;Round. A lot of people
        ask us, how do you two met? How did you decide to open a cake store? We
        always say it is a long story. We both studied in TU Delft, Bing studied
        Interaction Design and Chao studied Computer Science. After graduated
        and worked for a while, in 2015, we met each other on a dinner party
        (yes food links Chinese people together). We became friends and we did a
        lot of morning joggings together that spring. Later we found that we
        both have passion in baking and we both dream of opening a shop. A
        little space where we meet people, share our stories and interests.
        Finally we decided to make this dream come true together.
      </p>
      <p>
        Basically this is how the journey begins. Sometimes, things just come
        together naturally :)
      </p>
      <p>
        Thanks to this ‘Information Time’, we can easily access information from
        the internet or from books. It is mush easier to jump to a new field
        than several decades ago. A lot of people ask us, why are you doing
        something different than what you have studied? We say, why not? You can
        always use what you learned from study. Sometimes what you need is just
        a different view and always be open-minded!
      </p>

      <h5>Crossing the rivers, and climbing the mountains.</h5>
      <p>
        We both know that what we want to bring to our customers : tasty natural
        cake with lower amount of sugar; a cute and relax shop atmosphere and an
        unique experience. Here we can just try new recipes, create new
        flavours, share with people what we really like. We can also do
        workshops and other activities that bring people who are with same
        interests together. Maybe “Fluffy” is the best word to describe our
        cakes and the atmosphere: gentle, soft, warm and welcoming.
      </p>
      <div className="row justify-content-md-center mb-4">
        <div className="col col-md-8">
          <Img fluid={data.storyOfOurJourney.nodes[0].childImageSharp.fluid} />
        </div>
      </div>
      <p>
        During our preparation period, we focused on developing our products and
        we went to several markets to get direct feedback from customers. It was
        a great to fun to sell our cakes and talk to people. We gained
        confidence and a lot of support.
      </p>
      <p>
        Besides getting inspired, we also need to dive into areas that we are
        not familiar with. For example getting knowledge of taxes, management
        and just many many other small things around the shop itself. We did a
        lot of homework and visited a lot of people. It felt like swimming in a
        big ocean at the beginning, but slowly we have found our way. We feel so
        lucky because we did get a lot of help and advises. It turns out to be
        the coolest project we ever do.
      </p>
      <div className="row mb-4">
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[1].childImageSharp.fluid} />
        </div>
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[2].childImageSharp.fluid} />
        </div>
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[3].childImageSharp.fluid} />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[4].childImageSharp.fluid} />
        </div>
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[5].childImageSharp.fluid} />
        </div>
      </div>

      <h5>China &amp; Japan: fountain of inspirations</h5>
      <p>
        Nowadays in China, Japan or some other asian countries, there are many
        modern cafes which has creative characters and a ‘cute’ style. This is
        what we miss here in Holland, so we want to bring this type of ‘cute’ &amp;
        ‘forest’ style cafe to people here.
      </p>
      <p>
        Furthermore, we both love Japanese cake rolls and matcha, so it was not
        difficult for us to find our style and focus.
      </p>
      <p>
        In October 2016, we traveled to Japan to get inspired. It was an amazing
        trip, we have tasted a lot of cake rolls, visited different Japanese
        cafes, and of course we couldn’t miss Uji, the hometown of matcha. It is
        an important ‘field research’ to us.
      </p>
      <div className="row mb-4">
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[6].childImageSharp.fluid} />
        </div>
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[7].childImageSharp.fluid} />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[8].childImageSharp.fluid} />
        </div>
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[9].childImageSharp.fluid} />
        </div>
      </div>

      <h5>We found Rotterdam, or Rotterdam found us?</h5>
      <p>
        In the meanwhile of baking cakes &amp; writing our business plan, we were
        searching for a shop location. Finally we came to Rotterdam which is
        full of new concept and cool ideas. We explored the city and we found
        this little place on Hoogstraat. We love the atmosphere and friendly
        hosts on this part of the street. Then things went smoothly: we got the
        key of our shop location!
      </p>
      <p>
        If you are curious that which part of the preparation period was the
        most impressive part?
      </p>
      <p>
        We’d say the renovation :P We did a lot of work that we’v never done
        before: like equalising the floor, tiling, sanding and drilling... We
        showed our girl power. These D.I.Y work was tough but also made this
        place more like our baby to us. Luckily we got a group of great friends
        who can help here and there, you also made the process more fun.
      </p>
      <div className="row mb-4">
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[10].childImageSharp.fluid} />
        </div>
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[11].childImageSharp.fluid} />
        </div>
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[12].childImageSharp.fluid} />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[13].childImageSharp.fluid} />
        </div>
        <div className="col col-md-6">
          <Img fluid={data.storyOfOurJourney.nodes[14].childImageSharp.fluid} />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[15].childImageSharp.fluid} />
        </div>
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[16].childImageSharp.fluid} />
        </div>
        <div className="col col-md-4">
          <Img fluid={data.storyOfOurJourney.nodes[17].childImageSharp.fluid} />
        </div>
      </div>
      <p>
        On January 16th 2016, we had our Grand Opening. We will always remember
        that day, with chaos, surprises, laughters and tears. In general, we
        survived our first day :) and the journey of Round&amp;Round shop officially
        begins.
      </p>
      <div className="row justify-content-md-center mb-4">
        <div className="col col-md-8">
          <Img fluid={data.storyOfOurJourney.nodes[18].childImageSharp.fluid} />
        </div>
      </div>

      <h5>Our journey just began...</h5>
      <p>
        From that day, we are here almost everyday to meet different people. We
        serve the cakes &amp; drinks we also love. We are lucky that we have met a
        lot of cute clients and we become friends. Our new partner Sissy was one
        of our customers as well. We are lucky girls!
      </p>
      <div className="row justify-content-md-center mb-4">
        <div className="col col-md-8">
          <Img fluid={data.storyOfOurJourney.nodes[19].childImageSharp.fluid} />
        </div>
      </div>
      <p>
        To run a shop is never easy, but we have a smile on our faces everyday.
        Isn’t it enough? :) When this story has been written, Round &amp; Round is
        just one and half year old. We are still very young and we still have a
        lot ideas that we want to experiment.
      </p>
      <p>
        People ask what our final goals and dreams are. It is always difficult
        to answer. We just want to be better and better :) There are several
        things we definitely want to achieve: Making more awesome creations with
        Matcha, making our shop a real awesome ‘matcha forest’ in Holland. We
        also want to contribute more in culture exchange by brining more
        cross-culture food, craft and workshops. And most importantly staying
        creative and passionate!
      </p>
      <p>
        At the end, we want to give our great thanks to people who have
        supported us on our journey, special thanks to families and friends of
        Bing &amp; Chao, who are always there for us; and of course our cute
        customers who are always as curious as we are.
      </p>
      <p>
        We hope our story will be inspiring to you, and see you around in
        Round&amp;Round
      </p>
      <div className="row mb-4">
        <div className="col">
          <Img fluid={data.storyOfOurJourney.nodes[20].childImageSharp.fluid} />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <Img fluid={data.storyOfOurJourney.nodes[21].childImageSharp.fluid} />
        </div>
      </div>
      <div className="row mb-4">
        <div className="col">
          <Img fluid={data.storyOfOurJourney.nodes[22].childImageSharp.fluid} />
        </div>
      </div>

      <p>
        Love,
        <br />
        Team R&amp;R
        <br />
        2017 Autumn
      </p>
    </Layout>
  );
};

export default OurStory;