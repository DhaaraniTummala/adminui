import { Typography } from '@material-tailwind/react';
import './Footer.css';
import { getYear } from 'date-fns';

const years = getYear(new Date());

export default function Footer() {
  return (
    // <footer className="flex w-full flex-row flex-wrap  border-t border-blue-gray-50 py-6  md:justify-between">
    //   <ul className="flex flex-wrap  gap-y-2 gap-x-8" style={{ marginTop: '10px' }}>
    //     <li className="footer-item">
    //       <Typography
    //         as="a"
    //         style={{ fontSize: '10px', marginLeft: '0px' }}
    //         href="#"
    //         color="blue-gray"
    //         className="footer_copyright_text font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-xs sm:text-sm md:text-base lg:text-lg flex-col w-full sm:w-auto"
    //       >
    //         Copyright © 2022 Maiden Cube Pvt Ltd . All rights reserved.
    //       </Typography>
    //     </li>
    //     <div className="div">
    //       <li className="footer-item">
    //         <Typography
    //           as="a"
    //           href="#"
    //           color="blue-gray"
    //           className="footer_privacy_policy_texts font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-xs sm:text-sm md:text-base lg:text-lg flex-col w-full sm:w-auto"
    //         >
    //           Privacy Policy
    //         </Typography>
    //       </li>
    //       <li className="footer-item">
    //         <Typography
    //           as="a"
    //           href="#"
    //           style={{ fontSize: '10px' }}
    //           color="blue-gray"
    //           className="footer_term_conditionfont-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-xs sm:text-sm md:text-base lg:text-lg flex-col w-full sm:w-auto"
    //         >
    //           Terms & Condition
    //         </Typography>
    //       </li>
    //     </div>
    //   </ul>
    // </footer>
    <footer className="flex w-full flex-wrap items-center border-t border-blue-gray-100 py-6">
      <div className="w-full flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ul className="flex flex-wrap gap-4 md:gap-8 lg:gap-8">
            <li className="footer-item">
              <Typography
                as="a"
                style={{ fontSize: '11px', fontFamily: 'Poppins' }}
                href="#"
                color="blue-gray"
                className="footer_copyright_text font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-xs sm:text-sm md:text-base lg:text-lg"
              >
                Copyright © {years} Maiden Cube Pvt Ltd. All rights reserved.
              </Typography>
            </li>
          </ul>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 lg:gap-8  md:mt-0">
          <ul className="flex flex-wrap gap-4 md:gap-8 lg:gap-8">
            <li className="footer-item">
              <Typography
                as="a"
                href="#"
                color="blue-gray"
                style={{ fontSize: '11px', fontFamily: 'Poppins' }}
                className="footer_privacy_policy_texts font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-xs sm:text-sm md:text-base lg:text-lg"
              >
                Privacy Policy
              </Typography>
            </li>
            <li className="footer-item">
              <Typography
                as="a"
                href="#"
                style={{ fontSize: '11px', fontFamily: 'Poppins' }}
                color="blue-gray"
                className="footer_term_condition font-normal transition-colors hover:text-blue-500 focus:text-blue-500 text-xs sm:text-sm md:text-base lg:text-lg"
              >
                Terms & Conditions
              </Typography>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
