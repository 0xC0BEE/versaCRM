import React from 'react';
import PageWrapper from '../layout/PageWrapper';
// FIX: Changed default import of 'Card' to a named import '{ Card, CardHeader, CardTitle, CardContent }' and refactored usage to resolve module export error.
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string }> = ({ children, language = 'bash' }) => (
    <pre className={`p-4 bg-gray-800 text-white rounded-lg text-sm overflow-x-auto language-${language}`}>
        <code>{children}</code>
    </pre>
);

const ApiDocsPage: React.FC = () => {
    return (
        <PageWrapper>
            <h1 className="text-3xl font-bold text-text-heading mb-2">API Documentation</h1>
            <p className="text-text-secondary mb-6">Integrate your applications with VersaCRM.</p>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-text-secondary mb-4">
                            Authenticate your API requests by including your secret key in the `Authorization` header.
                            You can manage your API keys in your <a href="#" onClick={(e) => { e.preventDefault(); /* Navigate to settings */ }} className="text-primary hover:underline">API settings</a>.
                        </p>
                        <CodeBlock>
                            {`curl "https://api.versacrm.com/v1/contacts" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                        </CodeBlock>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rate Limiting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-text-secondary">
                            The API is rate limited to 100 requests per minute. If you exceed this limit, you will receive a `429 Too Many Requests` response.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-1"><span className="font-mono text-sm bg-blue-500/10 text-blue-400 px-2 py-1 rounded">GET</span> /v1/contacts</h3>
                                <p className="text-sm text-text-secondary mb-4">Retrieve a list of all contacts.</p>
                                <CodeBlock language="json">
                                    {`{
  "data": [
    {
      "id": "contact_1",
      "contactName": "John Patient",
      "email": "john.patient@example.com",
      "status": "Active"
    }
  ],
  "has_more": false
}`}
                                </CodeBlock>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-1"><span className="font-mono text-sm bg-green-500/10 text-green-400 px-2 py-1 rounded">POST</span> /v1/contacts</h3>
                                <p className="text-sm text-text-secondary mb-4">Create a new contact.</p>
                                <CodeBlock>
                                    {`curl "https://api.versacrm.com/v1/contacts" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "contactName": "New Lead",
        "email": "new.lead@example.com",
        "status": "Lead"
      }'`}
                                </CodeBlock>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-1"><span className="font-mono text-sm bg-green-500/10 text-green-400 px-2 py-1 rounded">POST</span> /v1/deals</h3>
                                <p className="text-sm text-text-secondary mb-4">Create a new deal.</p>
                                <CodeBlock>
                                    {`curl "https://api.versacrm.com/v1/deals" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
        "name": "New Website Project",
        "value": 15000,
        "contactId": "contact_1"
      }'`}
                                </CodeBlock>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
};

export default ApiDocsPage;