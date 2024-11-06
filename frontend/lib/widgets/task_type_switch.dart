import 'package:flatshare/const.dart';
import 'package:flatshare/models/task.dart';
import 'package:flutter/material.dart';

class TaskTypeSwitch extends StatefulWidget {
  const TaskTypeSwitch(
      {super.key,
      required this.selectedTaskType,
      required this.onTaskTypeSelect});

  final TaskType selectedTaskType;
  final Function(TaskType) onTaskTypeSelect;

  @override
  State<StatefulWidget> createState() => TaskTypeSwitchState();
}

class TaskTypeSwitchState extends State<TaskTypeSwitch> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2.0),
      child: Container(
        decoration: BoxDecoration(
            borderRadius: const BorderRadius.all(Radius.circular(10)),
            color: Colors.grey[300]),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            children: [
              Expanded(
                  child: ElevatedButton(
                      style: ButtonStyle(
                          foregroundColor: WidgetStateProperty.all(
                              widget.selectedTaskType == TaskType.recurring
                                  ? Colors.white
                                  : Colors.black),
                          backgroundColor: WidgetStateProperty.all<Color>(
                              widget.selectedTaskType == TaskType.recurring
                                  ? Colors.blueAccent
                                  : Colors.grey.shade300),
                          textStyle: WidgetStateProperty.all<TextStyle>(
                            TextStyle(
                              fontWeight:
                                  widget.selectedTaskType == TaskType.recurring
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                            ),
                          ),
                          shape: WidgetStateProperty.all(
                            RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          elevation: WidgetStateProperty.all(generalElevation)),
                      onPressed: () {
                        widget.onTaskTypeSelect(TaskType.recurring);
                      },
                      child: const Text("Recurring Tasks"))),
              const SizedBox(width: 4),
              Expanded(
                  child: ElevatedButton(
                      style: ButtonStyle(
                          backgroundColor: WidgetStateProperty.all(
                              widget.selectedTaskType == TaskType.oneOff
                                  ? Colors.blueAccent
                                  : Colors.grey.shade300),
                          foregroundColor: WidgetStateProperty.all(
                              widget.selectedTaskType == TaskType.oneOff
                                  ? Colors.white
                                  : Colors.black),
                          textStyle: WidgetStateProperty.all<TextStyle>(
                            TextStyle(
                              fontWeight:
                                  widget.selectedTaskType == TaskType.oneOff
                                      ? FontWeight.bold
                                      : FontWeight.normal,
                            ),
                          ),
                          shape:
                              WidgetStateProperty.all<RoundedRectangleBorder>(
                            RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          )),
                      onPressed: () {
                        widget.onTaskTypeSelect(TaskType.oneOff);
                      },
                      child: const Text("One-Time Tasks"))),
            ],
          ),
        ),
      ),
    );
  }
}
