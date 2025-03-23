import mjml2html from 'mjml';
export const welcomeEmailTemplate = (name: string) => `
<mjml>
    <mj-body>
        <mj-section background-color="#f0f0f0">
            <mj-column>
                <mj-text align="center" font-size="24px" color="#333333" font-family="Arial, sans-serif">
                    Welcome to Our App!
                </mj-text>
                <mj-text align="center" font-size="16px" color="#555555" font-family="Arial, sans-serif">
                    Hello ${name},
                </mj-text>
                <mj-text align="center" font-size="16px" color="#555555" font-family="Arial, sans-serif">
                    We're excited to have you on board. Get ready to explore all the amazing features we have to offer.
                </mj-text>
                <mj-button background-color="#007bff" color="#ffffff" font-family="Arial, sans-serif" href="https://yourapp.com">
                    Get Started
                </mj-button>
                <mj-text align="center" font-size="14px" color="#777777" font-family="Arial, sans-serif">
                    If you have any questions, feel free to reach out to our support team.
                </mj-text>
            </mj-column>
        </mj-section>
    </mj-body>
</mjml>
`;