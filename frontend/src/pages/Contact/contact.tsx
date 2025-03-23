import React, { useState } from 'react';
import './contact.css';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  TwitterOutlined,
  InstagramOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { DownOutlined } from '@ant-design/icons';
import { Input, Button } from 'antd';

// Contact Information array
const contactInfo = [
  {
    icon: <PhoneOutlined />,
    text: '+1012 3456 789',
  },
  {
    icon: <MailOutlined />,
    text: 'demo@gmail.com',
  },
  {
    icon: <EnvironmentOutlined />,
    text: '132 Dartmouth Street Boston, Massachusetts 02156 United States',
  },
];

// Social Media array
const socialMedia = [
  {
    icon: <TwitterOutlined />,
    link: 'https://twitter.com',
  },
  {
    icon: <InstagramOutlined />,
    link: 'https://instagram.com',
  },
  {
    icon: <MessageOutlined />,
    link: 'https://discord.com',
  },
];

const formFields = [
  {
    label: 'First Name',
    placeholder: '1',
  },
  {
    label: 'Last Name',
    placeholder: 'John',
  },
  {
    label: 'Email Name',
    placeholder: 'why@gmail.com',
  },
  {
    label: 'Phone Number',
    placeholder: '+61 ABCXEZ',
  },
];

// type DropdownOption = "Option 1" | "Option 2" | "Option 3";

function Contact() {
  const [isOpen, setIsOpen] = useState(false);
  // const [selectedSubject, setSelectedSubject] = useState<DropdownOption | null>(
  //   null
  // );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // const handleSubjectChange = (value: DropdownOption) => {
  //   setSelectedSubject(value);
  // };

  return (
    <div className="contactContainer">
      <div className="contactHeader">
        <h2 className="contactHeader_h1">Contact Us</h2>
        <p className="contactHeader_p">
          Any question or remarks? Just write us a message!
        </p>
      </div>

      <div className="contactDetails">
        {/* Left Section for Contact Information */}
        <div className="contactDetails_left">
          <div className="ball contactDetails_left_ball1 "></div>
          <div className="ball contactDetails_left_ball2"></div>
          <div className="contactDetails_left_gapleft">
            <div className="contactDetails_left_text">
              <h1 className="contactDetails_left_text_h1">
                Contact Information
              </h1>
              <p className="contactDetails_left_text_p">
                Say something to start a live chat!
              </p>
            </div>

            {/* Mapping through contactInfo array */}
            <div className="contactDetails_left_information">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="contactDetails_left_information_details"
                >
                  <p className="contactDetails_left_information_details_icon">
                    {item.icon}
                  </p>
                  <p className="contactDetails_left_information_details_text">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Social Media Links */}
            <div className="contactDetails_left_socialMedia">
              {socialMedia.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contactDetails_left_socialMedia_box"
                >
                  <div className="contactDetails_left_socialMedia_icon">
                    {item.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section for the Contact Form */}
        <div className="contactDetails_right">
          <div className="contactDetails_right_Form">
            {formFields.map((field, index) => (
              <div key={index} className="contactDetails_right_Form_Area">
                <p className="contactDetails_right_Form_Area_p">
                  {field.label}
                </p>
                <Input
                  className="contactDetails_right_Form_Area_input"
                  type="text"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <div className="contactDetails_right_dropandtext">
            <div className="dropdown-container">
              <p className="dropdown-container_text">Select Subject?</p>
              <div onClick={toggleDropdown} className="dropdown-btn">
                <DownOutlined className="dropdownlogo" />
              </div>

              {isOpen && (
                <ul className="dropdown-menu">
                  <li className="dropdown-item">Option 1</li>
                  <li className="dropdown-item">Option 2</li>
                  <li className="dropdown-item">Option 3</li>
                </ul>
              )}
            </div>

            <div className="right_colMsg">
              <p className="right_colMsg_p">Message</p>
              <Input
                className="right_colMsg_input"
                type="text"
                placeholder="Write your message.."
              />
              <Button className="right_colMsg_submit">Send Message</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
