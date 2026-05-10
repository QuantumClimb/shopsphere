// Testing using native fetch
async function testApi() {
  const baseUrl = 'http://localhost:3001/api';
  
  try {
    console.log('Testing GET /api/admin/menu-items...');
    const getRes = await fetch(`${baseUrl}/admin/menu-items?limit=1`);
    const getData = await getRes.json();
    
    if (getData.items && getData.items.length > 0) {
      const item = getData.items[0];
      console.log('✅ Successfully fetched item:', item.name);
      console.log('Fields present:', Object.keys(item).join(', '));
      
      const originalGender = item.gender;
      const testGender = originalGender === 'Male' ? 'Female' : 'Male';
      
      console.log(`Testing PUT /api/admin/menu-items/${item.id} with gender: ${testGender}...`);
      const putRes = await fetch(`${baseUrl}/admin/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          gender: testGender
        })
      });
      
      const putData = await putRes.json();
      if (putRes.ok && putData.gender === testGender) {
        console.log('✅ Successfully updated gender!');
      } else {
        console.error('❌ Failed to update gender:', putData);
      }
      
      // Revert change
      await fetch(`${baseUrl}/admin/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          gender: originalGender
        })
      });
      console.log('✅ Reverted change.');
      
    } else {
      console.log('No items found in inventory.');
    }
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testApi();
