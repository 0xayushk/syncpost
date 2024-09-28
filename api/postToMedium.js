// pages/api/postToMedium.js
export default async function handler(req, res) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    console.error('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { postContent, mediumToken } = req.body;

  // Ensure all required fields are provided
  if (!postContent || !mediumToken) {
    console.error('Missing required fields:', { postContent, mediumToken });
    return res.status(400).json({ message: 'Post content and Medium token are required' });
  }

  try {
    // Fetch the user info from Medium to get the user ID
    const userResponse = await fetch("https://api.medium.com/v1/me", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${mediumToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorDetails = await userResponse.json();
      console.error('Failed to fetch Medium user details:', errorDetails);
      return res.status(401).json({ message: 'Failed to fetch Medium user details' });
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Prepare the post data
    const postData = {
      title: 'Your Post Title', // Customize as needed
      contentFormat: 'markdown',
      content: postContent,
      tags: [], // Optionally add tags
      publishStatus: 'public',
    };

    // Post the content to Medium
    const postResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mediumToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    // Check if the response is OK
    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      console.error('Failed to post to Medium:', errorData);
      return res.status(postResponse.status).json({ message: errorData.errors[0].message });
    }

    console.log('Posted to Medium successfully');
    return res.status(200).json({ message: 'Posted to Medium successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ message: 'Server error', error: error.toString() });
  }
}