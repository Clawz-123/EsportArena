from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            "Status_code": response.status_code,
            "Is_Success": False,
            "Error_Message": response.data,
            "Result": None,
        }

        if isinstance(response.data, dict):
            error_dict = {}
            for key, value in response.data.items():
                if isinstance(value, list):
                    error_dict[key] = " ".join([str(v) for v in value])
                else:
                    error_dict[key] = str(value)

            custom_response["Error_Message"] = error_dict

        return Response(custom_response, status=response.status_code)

    return Response(
        {
            "Status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Is_Success": False,
            "Error_Message": {"details": "Internal Server Error"},
            "Result": None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
