import asyncio

from app.services.scheduler import scheduler


async def main():
    scheduler.start()
    print("MementoCloud scheduler started.")

    try:
        await asyncio.Event().wait()
    finally:
        scheduler.shutdown(wait=False)


if __name__ == "__main__":
    asyncio.run(main())