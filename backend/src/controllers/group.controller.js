import Group from "../models/Group.js";
import User from "../models/User.js";

// Create a new group (requires at least 3 members including creator)
export async function createGroup(req, res) {
  try {
    const { name, description, memberIds } = req.body;
    const adminId = req.user.id;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: "Group name and member IDs are required" });
    }

    // Add admin to members if not already included
    const allMemberIds = [...new Set([adminId, ...memberIds])];

    // Check minimum 3 members
    if (allMemberIds.length < 3) {
      return res.status(400).json({ 
        message: "A group must have at least 3 members (including you)" 
      });
    }

    // Verify all members exist
    const membersExist = await User.countDocuments({
      _id: { $in: allMemberIds },
    });

    if (membersExist !== allMemberIds.length) {
      return res.status(400).json({ message: "One or more members not found" });
    }

    const group = await Group.create({
      name,
      description: description || "",
      admin: adminId,
      members: allMemberIds,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all groups the current user is a member of
export async function getMyGroups(req, res) {
  try {
    const userId = req.user.id;

    const groups = await Group.find({ members: userId })
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getMyGroups controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all public groups user can join
export async function getAvailableGroups(req, res) {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      isPublic: true,
      members: { $ne: userId }, // Not a member
    })
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getAvailableGroups controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Join a group
export async function joinGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.isPublic) {
      return res.status(403).json({ message: "This is a private group" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    group.members.push(userId);
    await group.save();

    const populatedGroup = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic");

    res.status(200).json(populatedGroup);
  } catch (error) {
    console.error("Error in joinGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Leave a group
export async function leaveGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    // Admin cannot leave, must transfer ownership first or delete group
    if (group.admin.toString() === userId) {
      return res.status(400).json({ 
        message: "Admin cannot leave the group. Transfer ownership or delete the group." 
      });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await group.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get group details
export async function getGroupById(req, res) {
  try {
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("admin", "fullName profilePic")
      .populate("members", "fullName profilePic nativeLanguage learningLanguage");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in getGroupById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete a group (admin only)
export async function deleteGroup(req, res) {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.admin.toString() !== userId) {
      return res.status(403).json({ message: "Only the admin can delete this group" });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
