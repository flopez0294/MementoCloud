async def test_create_event(client, auth_user):
    response = await client.post(
        "/api/event",
        json={
            "event_name": "Test Event",
            "event_date": "2030-01-01",
            "timezone": "America/Los_Angeles",
            "password": "password123",
        },
        headers=auth_user
    )

    assert response.status_code == 201