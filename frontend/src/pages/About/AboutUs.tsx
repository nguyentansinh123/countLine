import React from "react";
import "./AboutUs.css";

// Define the type for the About section data
interface AboutSection {
  title: string;
  description: string;
  imageUrl: string;
}

const aboutData: AboutSection[] = [
  {
    title: "Who Are We",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    imageUrl:
      "https://as1.ftcdn.net/jpg/01/23/19/32/1000_F_123193256_KgXUWhHjSudpE8ZO7qK17OxscfRW9R6K.jpg",
  },
  {
    title: "Our Mission",
    description:
      "We aim to provide the best services to our clients and create a sustainable future through innovation and dedication.",
    imageUrl:
      "https://as1.ftcdn.net/jpg/01/23/19/32/1000_F_123193256_KgXUWhHjSudpE8ZO7qK17OxscfRW9R6K.jpg",
  },
];

const About: React.FC = () => {
  return (
    <div className="AboutContainer">
      <div className="AboutContainer_headerText">
        <h1 className="AboutContainer_headerText_h1">About Us</h1>
      </div>

      <div className="About_gridContainer">
        {aboutData.map((section, index) => (
          <div key={index} className="About_textBlockWrapper">
            <div className={`About_textBlock ${index % 2 === 0 ? "" : "About_textBlockRight"}`}>
              <div className="About_textBlock_Header center">
                <h2 className="About_textBlock_Header_h2">{section.title}</h2>
              </div>
              <div className="About_textBlock_Header_blockHeader">
                <h1 className="About_textBlock_Header_blockHeader_h1">{section.title}</h1>
              </div>
              <div className="About_textBlock_Header_paragraph">
                <p className="About_textBlock_Header_paragraph_p">{section.description}</p>
              </div>
            </div>
            <div className="About_textBlock_image_block">
              <img className="About_textBlock_image" src={section.imageUrl} alt={section.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
