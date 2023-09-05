import { useQuery } from "@apollo/client";
import { Table } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import BookingSummary from "../../components/BookingSummary";
import GuestDetailsInfo from "../../components/GuestDetailsInfo";
import TitleText from "../../components/Title";
import {
  CreateBookingInput,
  PaymentStatus,
} from "../../graphql/__generated__/graphql";
import {
  GET_BOOKING,
  GET_CONTACT,
} from "../../graphql/queries/bookingDetailsQueries";
import { GET_ROOM_BOOKING } from "../../graphql/queries/roomBookingQueries";
import { RootState } from "../../store";

export interface BookingDetails extends CreateBookingInput {}

const BookingDetails = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const { bookingId } = useParams();

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    roomBookings: [],
    customer: "",
    hotel: user?.hotels[0] || "",
    paymentStatus: PaymentStatus.Unpaid,
  });

  const { data } = useQuery(GET_ROOM_BOOKING, {
    variables: {
      roomBookingFilter: {
        hotel: user?.hotels[0] || "",
        booking: bookingId,
      },
    },
  });

  const { data: bookingInfo } = useQuery(GET_BOOKING, {
    variables: {
      id: bookingId || "",
    },
  });

  const contactId = bookingInfo?.booking?.customer || "";

  const { data: contactInfo } = useQuery(GET_CONTACT, {
    variables: {
      id: contactId,
    },
  });

  const roomBookings = data?.roomBookings || [];

  const columns = [
    {
      title: "Check In",
      dataIndex: "checkin",
      key: "checkin",
    },
    {
      title: "Check Out",
      dataIndex: "checkout",
      key: "checkout",
    },
    {
      title: "Room Type",
      dataIndex: "roomType",
      key: "room",
    },
    {
      title: "Room No",
      dataIndex: "roomNo",
      key: "roomNo",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  const dataSource = roomBookings.map((room) => ({
    key: room._id,
    checkin: room.checkIn,
    checkout: room.checkOut,
    status: room.status,
  }));

  useEffect(() => {
    setBookingDetails((booking) => ({
      ...booking,
      roomBookings: roomBookings,
    }));
  }, [roomBookings]);

  return (
    <>
      <div
        className={`flex items-center justify-between ${
          bookingId && "justify-between"
        }`}
      >
        {location.pathname === `/booking-details/${bookingId}` && (
          <>
            <TitleText text="Booking Details" />
            <Link
              className="text-white  py-2 rounded-md mb-2 font-semibold capitalize flex items-center gap-2  bg-blue-900 px-20 hover:text-white"
              to={`/edit-booking/${bookingId}`}
            >
              Edit Booking
            </Link>
          </>
        )}
      </div>
      <div className="grid grid-cols-12 mt-5">
        <div className="col-span-8 bg-white shadow-sm p-5 mr-4">
          {/* room details */}
          <h1 className="font-semibold text-xl text-gray-500 mb-4 capitalize">
            Room Details
          </h1>
          <Table
            dataSource={dataSource}
            columns={columns}
            size="small"
            pagination={false}
          />
          {/* guest details part */}
          <GuestDetailsInfo
            onSelect={(contact) => {
              setBookingDetails({
                ...bookingDetails,
                customer: contact._id,
              });
            }}
            contactInfo={contactInfo?.contact}
            isDetails
          />
        </div>
        {/* booking summary || Payment flow */}
        <BookingSummary bookingDetails={bookingDetails} />
      </div>
    </>
  );
};

export default BookingDetails;
