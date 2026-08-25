Quick DB setup (Postgres via Docker)

1. Ensure Docker is installed and running.
2. From project root run:

```bash
docker-compose up -d
```

This starts Postgres and initializes the schema from `database/schema.sql`.

3. Create a `.env` file in `backend` or at project root with:

```
DATABASE_URL=postgresql://ps_event:ps_event_pass@localhost:5432/ps_event_dev
```

4. Start backend (if not already running):

```bash
cd backend
npm install
npm run dev
```

5. Verify health:

```
curl http://localhost:3000/api/health
```

Notes:
- The compose maps Postgres port 5432 on the host. If you already have Postgres running, change the port mapping in `docker-compose.yml` or stop the other service.
- The init SQL (`database/schema.sql`) runs only when the database directory is empty. To re-run schema, remove the `pgdata` volume and restart: `docker-compose down -v` then `docker-compose up -d`.

Uploads API
-----------
The backend exposes a simple upload endpoint to store event images under `/uploads`:

POST /api/uploads
- multipart/form-data with field `file`
- Response: `{ "url": "http://localhost:3000/uploads/<filename>" }`

Example using curl:
```bash
curl -F "file=@./my-photo.jpg" http://localhost:3000/api/uploads
```

After uploading, save the returned URL to `events.cover_image_url` or insert into `event_images` table.

Image management endpoints
- `GET /api/events/:id/images` — list images for event
- `POST /api/events/:id/images` — create image record (body: `{ url, caption?, sort_order? }`)
- `PATCH /api/events/:id/images/:imageId` — update caption/sort_order
- `DELETE /api/events/:id/images/:imageId` — delete image

You can manage images from the admin editor in the frontend: edit caption (✎) or delete (✖) images.
